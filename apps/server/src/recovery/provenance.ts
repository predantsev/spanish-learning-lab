// Portable review provenance (API.md): historical ExecutionReceipts carry keyId + hex HMAC-SHA256 signature over
// canonical sorted-key UTF-8 JSON of every field except `signature`. A receipt verifies only with the original
// local key; on another installation it is imported historical evidence that requires explicit source trust.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Db } from '../db/connection.ts';

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v)).join(',')}]`;
  const o = value as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .filter((k) => o[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(o[k])}`)
    .join(',')}}`;
}

interface ReceiptLike {
  readonly keyId: string;
  readonly signature: string;
  readonly [k: string]: unknown;
}

function isReceipt(v: unknown): v is ReceiptLike {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.keyId === 'string' && typeof o.signature === 'string' && /^[0-9a-f]{64}$/.test(o.signature);
}

export function verifyReceipt(receipt: ReceiptLike, key: Buffer | undefined): boolean {
  if (!key) return false;
  const { signature, ...fields } = receipt;
  const expected = createHmac('sha256', key).update(canonicalJson(fields), 'utf8').digest();
  const given = Buffer.from(signature, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** JSON columns that may embed review execution receipts. */
const RECEIPT_COLUMNS: ReadonlyArray<readonly [string, string]> = [
  ['content_revisions', 'provenance'],
  ['review_reports', 'report'],
  ['adjudications', 'provenance'],
];

export interface ReceiptScan {
  readonly total: number;
  readonly unverified: number;
}

/** Counts historical receipts in an imported profile and how many cannot be verified with local keys. */
export function scanReceipts(db: Db, keyFor: (keyId: string) => Buffer | undefined): ReceiptScan {
  let total = 0;
  let unverified = 0;
  const visit = (v: unknown, depth: number, budget: { nodes: number }): void => {
    if (depth > 32 || budget.nodes-- <= 0 || typeof v !== 'object' || v === null) return;
    if (isReceipt(v)) {
      total++;
      if (!verifyReceipt(v, keyFor(v.keyId))) unverified++;
      return;
    }
    for (const child of Array.isArray(v) ? v : Object.values(v)) visit(child, depth + 1, budget);
  };
  for (const [table, column] of RECEIPT_COLUMNS) {
    for (const row of db.prepare(`SELECT "${column}" AS j FROM "${table}"`).iterate() as IterableIterator<{ j: string }>) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(row.j);
      } catch {
        continue; // json_valid CHECK makes this unreachable for imported rows
      }
      visit(parsed, 0, { nodes: 10_000 });
    }
  }
  return { total, unverified };
}
