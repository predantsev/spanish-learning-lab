// On-disk review records under content/reviews and the readiness-evidence index.
//
// Layout (no private learner data; synthetic or course content only):
//   <batchId>/packet.json                       review packet (packetHash = sha256 canonical JSON)
//   <batchId>/report-schema.json                output schema given to the reviewer model
//   <batchId>/runs/<jobId>/prompt.txt           prompt exactly as sent (stdin of codex exec)
//   <batchId>/runs/<jobId>/events.jsonl         raw `codex exec --json` stdout
//   <batchId>/runs/<jobId>/stderr.txt           raw stderr (includes the codex wrapper note)
//   <batchId>/runs/<jobId>/last-message.txt     raw final model message (`-o`)
//   <batchId>/runs/<jobId>/report.json          parsed report (ReviewReport + per-item findings)
//   <batchId>/runs/<jobId>/run.json             command, versions, timings, usage, file hashes
//   <batchId>/runs/<jobId>/receipt.json         signed ExecutionReceipt
//   <batchId>/findings.json                     findings recorded by `apply`
//   <batchId>/apply-<jobId>.json                status transitions applied
//   validation/<receiptId>.json                 local validation receipts written by `promote`
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ExecutionReceipt, ReviewReport } from '@sll/contracts';
import { canonicalSha256 } from '../content/canonical.ts';
import type { ReceiptIndex } from '../content/validate.ts';
import type { EntityKind, ReviewStatus } from '../content/types.ts';
import type { ReviewKey } from './keys.ts';
import { loadKey, resolveKeysDir } from './keys.ts';
import { verifyReceipt } from './receipts.ts';

export const REVIEW_PROVIDERS = ['openai', 'anthropic', 'google', 'local', 'other'] as const;
export type ReviewProvider = (typeof REVIEW_PROVIDERS)[number];

export const FINDING_CATEGORIES = [
  'false-rule',
  'valid-alternative-rejected',
  'wrong-key',
  'answer-leakage',
  'unknown-prerequisite',
  'regional-overclaim',
  'poor-ukrainian',
  'wrong-level-or-meaning',
  'conflicting-feedback-or-support',
  'other',
  // Calibrated v3/v2 reviewer verdicts (content/reviews/calibration/prompts/review-output.schema.json).
  'flawed',
  'uncertain',
] as const;
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export type Severity = 'blocking' | 'minor' | 'none';

export interface PacketItem {
  kind: EntityKind;
  logicalId: string;
  contentHash: string;
  reviewStatus: ReviewStatus;
  body: unknown;
}

export interface ReviewPacket {
  schemaVersion: 1;
  batchId: string;
  createdAt: string;
  toolVersion: string;
  scope:
    | { type: 'lesson'; lessonId: string }
    | { type: 'skills'; skillIds: string[] }
    | { type: 'items'; items: Array<{ kind: EntityKind; id: string }> };
  authorProvider: ReviewProvider;
  author: { provider: ReviewProvider; model?: string; effort?: string };
  sourceDigest: string;
  instructions: {
    role: string;
    duties: string[];
    severity: Record<Severity, string>;
    checkingRules: string[];
    evidenceRules: string[];
  };
  /** Targets assessed by the batch (`skillId/modality`). */
  targets: string[];
  items: PacketItem[];
  context: { skills: unknown[]; sources: unknown[]; lessons: Array<{ id: string; titleUk: string; order: number }> };
  /** Exactly what the calibrated reviewer receives as packet.json (one case per item, caseId = kind:id). */
  reviewerPacket: ReviewerPacket;
  packetHash: string;
}

export interface ReviewerCase {
  caseId: string;
  context: {
    lessonId: string;
    lessonTopic: string;
    taughtBefore: string[];
    targets: Array<{ target: string; description: string }>;
  };
  clips?: unknown[];
  /** Task cases use the calibrated shape. */
  task?: unknown;
  /** Non-task items (lesson, skill, lexeme, clip, …): outside the calibrated case set. */
  content?: { kind: EntityKind; body: unknown };
}

export interface ReviewerPacket {
  schemaVersion: 1;
  packetId: string;
  description: string;
  cases: ReviewerCase[];
}

/** One entry of the calibrated reviewer output (review-output.schema.json). */
export interface ReviewerVerdict {
  caseId: string;
  reviewerAnswer: string;
  verdict: 'valid' | 'flawed' | 'uncertain';
  blocking: 'yes' | 'no';
  element: string;
  defect: string;
  correction: string;
  sources: string[];
  notes: string;
}

/** Route metadata signed through report.json (the ExecutionReceipt contract has no free fields). */
export interface RouteMetadata {
  direction: 'A' | 'B';
  provider: 'openai' | 'anthropic';
  tool: 'codex exec' | 'claude -p';
  promptVersion: string;
  promptTemplate: { path: string; sha256: string };
  outputSchema: { path: string; sha256: string };
  promptAsSentSha256: string;
  reviewerPacketSha256: string;
  argv: string[];
  env: Record<string, string>;
  cwd: string;
  workingDirectoryContents: string[];
  cliVersion: string;
  requestedModel: string;
  requestedEffort: string;
  resolved: Record<string, unknown>;
}

export interface ItemFinding {
  severity: 'blocking' | 'minor';
  category: FindingCategory;
  location: string;
  description: string;
  suggestion: string;
}

export interface ReportItem {
  kind: EntityKind;
  logicalId: string;
  contentHash: string;
  /** Effective severity = max(declared, worst finding). */
  severity: Severity;
  declaredSeverity: Severity;
  findings: ItemFinding[];
  /** Calibrated reviewer fields (present for v3/v2 runs). */
  caseId?: string;
  verdict?: ReviewerVerdict['verdict'];
  reviewerAnswer?: string;
  notes?: string;
  sources?: string[];
}

export interface StoredReport {
  schemaVersion: 1 | 2;
  batchId: string;
  packetHash: string;
  /** Contract ReviewReport when it can be formed (≤30 targets and ≥1 https citation); otherwise null. */
  reviewReport: ReviewReport | null;
  reviewReportNote?: string;
  route?: RouteMetadata;
  reviewer?: { cases: ReviewerVerdict[] };
  items: ReportItem[];
  missingItems: Array<{ kind: EntityKind; logicalId: string }>;
  unexpectedItems: Array<{ kind: string; logicalId: string }>;
  missingVerdicts: string[];
}

export interface ValidationRecord {
  schemaVersion: 1;
  kind: EntityKind;
  logicalId: string;
  contentHash: string;
  reviewReceiptIds: string[];
  checks: string[];
  validator: string;
  validatedAt: string;
}

export interface StoredValidation {
  receipt: ExecutionReceipt;
  record: ValidationRecord;
}

export function packetHashOf(packet: Omit<ReviewPacket, 'packetHash'> & { packetHash?: string }): string {
  const { packetHash: _ignored, ...rest } = packet;
  return canonicalSha256(rest);
}

export const batchDir = (reviewsDir: string, batchId: string): string => join(reviewsDir, batchId);
export const runsDir = (reviewsDir: string, batchId: string): string => join(reviewsDir, batchId, 'runs');
export const runDir = (reviewsDir: string, batchId: string, jobId: string): string => join(reviewsDir, batchId, 'runs', jobId);
export const validationDir = (reviewsDir: string): string => join(reviewsDir, 'validation');

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function dirs(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((name) => statSync(join(path, name)).isDirectory())
    .sort();
}

export function listBatches(reviewsDir: string): string[] {
  return dirs(reviewsDir).filter((name) => existsSync(join(reviewsDir, name, 'packet.json')));
}

export function readPacket(reviewsDir: string, batchId: string): ReviewPacket {
  return readJson<ReviewPacket>(join(batchDir(reviewsDir, batchId), 'packet.json'));
}

export interface ReviewEvidence {
  batchId: string;
  jobId: string;
  packet: ReviewPacket;
  receipt: ExecutionReceipt;
  report: StoredReport;
  /** Empty when the evidence is acceptable for the Ready gate. */
  problems: string[];
}

export interface EvidenceOptions {
  reviewsDir: string;
  verifySignatures: boolean;
  key?: ReviewKey | undefined;
}

/** Loads every run receipt with its packet/report and the reasons it would not count. */
export function loadReviewEvidence(options: EvidenceOptions): ReviewEvidence[] {
  const out: ReviewEvidence[] = [];
  for (const batchId of listBatches(options.reviewsDir)) {
    let packet: ReviewPacket;
    try {
      packet = readPacket(options.reviewsDir, batchId);
    } catch {
      continue;
    }
    const packetOk = packetHashOf(packet) === packet.packetHash;
    for (const jobId of dirs(runsDir(options.reviewsDir, batchId))) {
      const dir = runDir(options.reviewsDir, batchId, jobId);
      if (!existsSync(join(dir, 'receipt.json')) || !existsSync(join(dir, 'report.json'))) continue;
      const receipt = readJson<ExecutionReceipt>(join(dir, 'receipt.json'));
      const report = readJson<StoredReport>(join(dir, 'report.json'));
      out.push({ batchId, jobId, packet, receipt, report, problems: evidenceProblems(packet, packetOk, receipt, report, options) });
    }
  }
  return out;
}

export function evidenceProblems(packet: ReviewPacket, packetOk: boolean, receipt: ExecutionReceipt, report: StoredReport, options: { verifySignatures: boolean; key?: ReviewKey | undefined }): string[] {
  const problems: string[] = [];
  if (!packetOk) problems.push('packet.json does not match its packetHash (edited after creation)');
  if (receipt.artifactHash !== packet.packetHash) problems.push('receipt.artifactHash is not the packet hash');
  if (report.packetHash !== packet.packetHash) problems.push('report.packetHash is not the packet hash');
  if (canonicalSha256(report) !== receipt.reportHash) problems.push('report.json does not match receipt.reportHash');
  if (receipt.provider === packet.authorProvider) problems.push(`reviewer provider ${receipt.provider} equals the author provider (no opposite-provider review)`);
  if (options.verifySignatures) {
    const check = verifyReceipt(receipt, options.key);
    if (!check.ok) problems.push(check.reason);
  }
  return problems;
}

export function loadValidations(reviewsDir: string, options: { verifySignatures: boolean; key?: ReviewKey | undefined }): Array<StoredValidation & { problems: string[] }> {
  const dir = validationDir(reviewsDir);
  if (!existsSync(dir)) return [];
  const out: Array<StoredValidation & { problems: string[] }> = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    const stored = readJson<StoredValidation>(join(dir, name));
    const problems: string[] = [];
    if (canonicalSha256(stored.record) !== stored.receipt.reportHash) problems.push('validation record does not match receipt.reportHash');
    if (stored.receipt.artifactHash !== stored.record.contentHash) problems.push('receipt.artifactHash is not the validated content hash');
    if (stored.record.reviewReceiptIds.length === 0) problems.push('validation record lists no review receipts');
    if (options.verifySignatures) {
      const check = verifyReceipt(stored.receipt, options.key);
      if (!check.ok) problems.push(check.reason);
    }
    out.push({ ...stored, problems });
  }
  return out;
}

const itemKey = (kind: string, id: string, hash: string): string => `${kind}|${id}|${hash}`;

export interface ReceiptIndexOptions {
  reviewsDir: string;
  /** Verify HMAC signatures (needs the local key); otherwise presence + hash binding only. */
  verifySignatures?: boolean;
  key?: ReviewKey | undefined;
}

export interface DiskReceiptIndex extends ReceiptIndex {
  /** Valid review receipt ids for an item hash. */
  reviewReceiptIds(kind: EntityKind, id: string, hash: string): string[];
}

export function createReceiptIndex(options: ReceiptIndexOptions): DiskReceiptIndex {
  const verifySignatures = options.verifySignatures ?? false;
  const key = options.key ?? (verifySignatures ? loadKey(resolveKeysDir()) : undefined);
  const reviews = new Map<string, string[]>();
  for (const evidence of loadReviewEvidence({ reviewsDir: options.reviewsDir, verifySignatures, key })) {
    if (evidence.problems.length > 0) continue;
    for (const item of evidence.report.items) {
      const inPacket = evidence.packet.items.some((p) => p.kind === item.kind && p.logicalId === item.logicalId && p.contentHash === item.contentHash);
      if (!inPacket || item.severity === 'blocking') continue;
      const k = itemKey(item.kind, item.logicalId, item.contentHash);
      reviews.set(k, [...(reviews.get(k) ?? []), evidence.receipt.id]);
    }
  }
  const validations = new Set<string>();
  for (const v of loadValidations(options.reviewsDir, { verifySignatures, key })) {
    if (v.problems.length === 0) validations.add(itemKey(v.record.kind, v.record.logicalId, v.record.contentHash));
  }
  return {
    hasReviewReceipt: (kind, id, hash) => reviews.has(itemKey(kind, id, hash)),
    hasValidationReceipt: (kind, id, hash) => validations.has(itemKey(kind, id, hash)),
    reviewReceiptIds: (kind, id, hash) => reviews.get(itemKey(kind, id, hash)) ?? [],
  };
}
