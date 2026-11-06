// Promotes `reviewed` items to `ready`, only when for the CURRENT content hash:
//   1. a signed opposite-provider review receipt verifies (HMAC with the local key), its packet and
//      report hashes match, and the report has no blocking finding for the item;
//   2. local validation reports no error attributed to the item.
// Then it writes a signed local validation receipt (content/reviews/validation/<id>.json) and sets
// reviewStatus to ready. Anything else is refused with reasons.
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalSha256 } from '../content/canonical.ts';
import { TOOL_VERSION, allEntities, entityHash, entityState, loadCorpus } from '../content/load.ts';
import type { AnyRecord } from '../content/load.ts';
import { loadLedger } from '../content/ledger.ts';
import { validateCorpus } from '../content/validate.ts';
import type { EntityKind } from '../content/types.ts';
import { loadKey, resolveKeysDir } from './keys.ts';
import { signReceipt } from './receipts.ts';
import { createReceiptIndex, readPacket, validationDir } from './store.ts';
import type { ValidationRecord } from './store.ts';
import { setReviewStatuses } from './status.ts';

export interface PromoteOptions {
  reviewsDir: string;
  sourceDir: string;
  ledgerPath: string;
  batchId?: string;
  items?: Array<{ kind: EntityKind; id: string }>;
  keysDir?: string;
  dryRun?: boolean;
  now?: () => Date;
}

export interface PromoteResult {
  promoted: Array<{ kind: EntityKind; id: string; contentHash: string; validationReceiptId?: string; reviewReceiptIds: string[] }>;
  refused: Array<{ kind: EntityKind; id: string; reasons: string[] }>;
}

export function promote(options: PromoteOptions): PromoteResult {
  const key = loadKey(options.keysDir ?? resolveKeysDir());
  const refs: Array<{ kind: EntityKind; id: string }> = options.items
    ? options.items
    : options.batchId
      ? readPacket(options.reviewsDir, options.batchId).items.map((i) => ({ kind: i.kind, id: i.logicalId }))
      : [];
  if (refs.length === 0) throw new Error('nothing to promote: pass --batch or --items');
  const result: PromoteResult = { promoted: [], refused: [] };
  if (!key) {
    for (const r of refs) result.refused.push({ ...r, reasons: ['no local review key: receipts cannot be verified'] });
    return result;
  }
  const { corpus, issues } = loadCorpus({ sourceDir: options.sourceDir });
  const loadErrors = issues.filter((i) => i.level === 'error');
  const index = createReceiptIndex({ reviewsDir: options.reviewsDir, verifySignatures: true, key });
  const validation = validateCorpus(corpus, loadLedger(options.ledgerPath), { allowIncomplete: true, receipts: index });
  const current = new Map(allEntities(corpus).map((r) => [`${r.kind}|${r.id}`, r]));
  const accepted: Array<{ record: AnyRecord; hash: string; reviewReceiptIds: string[] }> = [];
  for (const ref of refs) {
    const record = current.get(`${ref.kind}|${ref.id}`);
    const reasons: string[] = [];
    if (!record) {
      result.refused.push({ ...ref, reasons: ['entity does not exist'] });
      continue;
    }
    const state = entityState(record);
    const hash = entityHash(record);
    if (state !== 'reviewed') reasons.push(`status is ${state}, expected reviewed`);
    const reviewReceiptIds = index.reviewReceiptIds(ref.kind, ref.id, hash);
    if (reviewReceiptIds.length === 0) reasons.push('no verified opposite-provider review receipt without blocking findings for the current content hash');
    if (loadErrors.some((i) => i.file === record.file)) reasons.push(`source file ${record.file} fails schema validation`);
    for (const e of validation.errors) if (e.entity?.kind === ref.kind && e.entity.id === ref.id) reasons.push(`validation ${e.code}: ${e.message}`);
    if (reasons.length > 0) result.refused.push({ ...ref, reasons });
    else accepted.push({ record, hash, reviewReceiptIds });
  }
  if (options.dryRun) {
    result.promoted = accepted.map((a) => ({ kind: a.record.kind, id: a.record.id, contentHash: a.hash, reviewReceiptIds: a.reviewReceiptIds }));
    return result;
  }
  const now = options.now ?? (() => new Date());
  mkdirSync(validationDir(options.reviewsDir), { recursive: true });
  for (const a of accepted) {
    const record: ValidationRecord = {
      schemaVersion: 1,
      kind: a.record.kind,
      logicalId: a.record.id,
      contentHash: a.hash,
      reviewReceiptIds: a.reviewReceiptIds,
      checks: ['schema', 'references', 'teaching-order', 'answer-key-consistency', 'review-receipt-signature', 'opposite-provider'],
      validator: TOOL_VERSION,
      validatedAt: now().toISOString(),
    };
    const receipt = signReceipt(
      { jobId: randomUUID(), provider: 'local', model: 'sll-content-validator', effort: 'deterministic', artifactHash: a.hash, reportHash: canonicalSha256(record), completedAt: record.validatedAt },
      key,
    );
    writeFileSync(join(validationDir(options.reviewsDir), `${receipt.id}.json`), `${JSON.stringify({ receipt, record }, null, 2)}\n`);
    result.promoted.push({ kind: a.record.kind, id: a.record.id, contentHash: a.hash, validationReceiptId: receipt.id, reviewReceiptIds: a.reviewReceiptIds });
  }
  if (accepted.length > 0) setReviewStatuses(options.sourceDir, accepted.map((a) => ({ record: a.record, status: 'ready' as const })));
  return result;
}
