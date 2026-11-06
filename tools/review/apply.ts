// Applies a verified review run to content/source review statuses:
//   no blocking finding + unchanged content hash → reviewed
//   blocking finding                             → needs-review (finding text kept in content/reviews)
// Ready/quarantined items and items whose content changed since the packet are left untouched.
// Never sets `ready` and never edits content text.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allEntities, entityHash, entityState, loadCorpus } from '../content/load.ts';
import type { ReviewStatus } from '../content/types.ts';
import { loadKey, resolveKeysDir } from './keys.ts';
import { batchDir, evidenceProblems, packetHashOf, readJson, readPacket, runDir, runsDir } from './store.ts';
import type { ReportItem, StoredReport } from './store.ts';
import type { ExecutionReceipt } from '@sll/contracts';
import { setReviewStatuses } from './status.ts';
import type { StatusUpdate } from './status.ts';

export interface ApplyOptions {
  reviewsDir: string;
  sourceDir: string;
  batchId: string;
  jobId?: string;
  keysDir?: string;
  dryRun?: boolean;
  now?: () => Date;
}

export interface Transition {
  kind: string;
  id: string;
  from: ReviewStatus;
  to: ReviewStatus;
  severity: ReportItem['severity'];
}

export interface ApplyResult {
  jobId: string;
  receiptId: string;
  transitions: Transition[];
  skipped: Array<{ kind: string; id: string; reason: string }>;
  findingsPath?: string;
  logPath?: string;
}

/** Latest run of a batch that has a receipt, by receipt.completedAt. */
export function latestRun(reviewsDir: string, batchId: string): string | undefined {
  const dir = runsDir(reviewsDir, batchId);
  if (!existsSync(dir)) return undefined;
  const runs = readdirSync(dir)
    .filter((jobId) => existsSync(join(dir, jobId, 'receipt.json')))
    .map((jobId) => ({ jobId, at: readJson<ExecutionReceipt>(join(dir, jobId, 'receipt.json')).completedAt }))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  return runs[0]?.jobId;
}

export function applyReview(options: ApplyOptions): ApplyResult {
  const packet = readPacket(options.reviewsDir, options.batchId);
  const jobId = options.jobId ?? latestRun(options.reviewsDir, options.batchId);
  if (!jobId) throw new Error(`batch ${options.batchId} has no run with a receipt; run run-codex first`);
  const dir = runDir(options.reviewsDir, options.batchId, jobId);
  if (!existsSync(join(dir, 'receipt.json')) || !existsSync(join(dir, 'report.json'))) throw new Error(`run ${jobId} has no receipt/report`);
  const receipt = readJson<ExecutionReceipt>(join(dir, 'receipt.json'));
  const report = readJson<StoredReport>(join(dir, 'report.json'));
  const key = loadKey(options.keysDir ?? resolveKeysDir());
  const problems = evidenceProblems(packet, packetHashOf(packet) === packet.packetHash, receipt, report, { verifySignatures: true, key });
  if (problems.length > 0) throw new Error(`run ${jobId} cannot be applied: ${problems.join('; ')}`);

  const { corpus } = loadCorpus({ sourceDir: options.sourceDir });
  const current = new Map(allEntities(corpus).map((r) => [`${r.kind}|${r.id}`, r]));
  const reported = new Map(report.items.map((i) => [`${i.kind}|${i.logicalId}`, i]));
  const transitions: Transition[] = [];
  const skipped: ApplyResult['skipped'] = [];
  const updates: StatusUpdate[] = [];
  for (const item of packet.items) {
    const k = `${item.kind}|${item.logicalId}`;
    const reviewed = reported.get(k);
    const record = current.get(k);
    if (!reviewed) skipped.push({ kind: item.kind, id: item.logicalId, reason: 'not covered by the review report' });
    else if (!record) skipped.push({ kind: item.kind, id: item.logicalId, reason: 'entity no longer exists' });
    else if (entityHash(record) !== item.contentHash) skipped.push({ kind: item.kind, id: item.logicalId, reason: 'content changed since the packet; build a new packet' });
    else {
      const from = entityState(record);
      const to: ReviewStatus = reviewed.severity === 'blocking' ? 'needs-review' : 'reviewed';
      if (from === 'ready' || from === 'quarantined') {
        skipped.push({ kind: item.kind, id: item.logicalId, reason: `status ${from} is not changed by apply${reviewed.severity === 'blocking' ? ' (blocking finding: decide on quarantine manually)' : ''}` });
      } else if (from === to) skipped.push({ kind: item.kind, id: item.logicalId, reason: `already ${to}` });
      else {
        transitions.push({ kind: item.kind, id: item.logicalId, from, to, severity: reviewed.severity });
        updates.push({ record, status: to });
      }
    }
  }
  const result: ApplyResult = { jobId, receiptId: receipt.id, transitions, skipped };
  if (options.dryRun) return result;

  const withFindings = report.items.filter((i) => i.findings.length > 0);
  const appliedAt = (options.now ?? (() => new Date()))().toISOString();
  if (withFindings.length > 0) {
    result.findingsPath = join(batchDir(options.reviewsDir, options.batchId), `findings-${jobId}.json`);
    writeFileSync(result.findingsPath, `${JSON.stringify({ schemaVersion: 1, batchId: options.batchId, jobId, receiptId: receipt.id, recordedAt: appliedAt, items: withFindings }, null, 2)}\n`);
  }
  if (updates.length > 0) setReviewStatuses(options.sourceDir, updates);
  result.logPath = join(batchDir(options.reviewsDir, options.batchId), `apply-${jobId}.json`);
  writeFileSync(result.logPath, `${JSON.stringify({ schemaVersion: 1, batchId: options.batchId, jobId, receiptId: receipt.id, appliedAt, transitions, skipped }, null, 2)}\n`);
  return result;
}
