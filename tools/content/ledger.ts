// Curriculum ledger (docs/contracts/curriculum-ledger.json) and course order.
// Course order = block order A1-01…A1-06, A2-01…A2-08; inside a block L1…Ln, then C1 last.
import { readFileSync } from 'node:fs';

export interface LedgerRow {
  id: string;
  kind: 'objective' | 'lesson' | 'optional-check';
  blockId: string;
  description?: string;
}

export interface Ledger {
  path: string;
  sourceSha256?: string;
  rows: LedgerRow[];
  objectives: string[];
  lessons: string[];
  checks: string[];
  /** Supporting allocation IDs (CV-01…CV-06 in the real ledger). */
  cv: string[];
  blocks: string[];
}

const LESSON_RE = /^A([12])-0([1-8])-(?:L([0-9]{1,2})|(C1))$/;
const BLOCK_RE = /^A([12])-0([1-8])$/;

export function loadLedger(path: string): Ledger {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as {
    sourceSha256?: string;
    supportingAllocations?: unknown;
    rows?: unknown;
  };
  if (!Array.isArray(raw.rows)) throw new Error(`${path}: ledger has no rows array`);
  const rows: LedgerRow[] = [];
  for (const row of raw.rows as Array<Record<string, unknown>>) {
    const { id, kind, blockId, description } = row;
    if (typeof id !== 'string' || typeof blockId !== 'string') throw new Error(`${path}: malformed ledger row`);
    if (kind !== 'objective' && kind !== 'lesson' && kind !== 'optional-check') {
      throw new Error(`${path}: unknown ledger row kind ${String(kind)} for ${id}`);
    }
    rows.push({ id, kind, blockId, ...(typeof description === 'string' ? { description } : {}) });
  }
  const cv = Array.isArray(raw.supportingAllocations)
    ? (raw.supportingAllocations as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];
  const blocks = [...new Set(rows.map((r) => r.blockId))].sort(compareBlocks);
  return {
    path,
    ...(typeof raw.sourceSha256 === 'string' ? { sourceSha256: raw.sourceSha256 } : {}),
    rows,
    objectives: rows.filter((r) => r.kind === 'objective').map((r) => r.id),
    lessons: rows.filter((r) => r.kind === 'lesson').map((r) => r.id),
    checks: rows.filter((r) => r.kind === 'optional-check').map((r) => r.id),
    cv,
    blocks,
  };
}

function blockKey(blockId: string): number {
  const m = BLOCK_RE.exec(blockId);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * 100 + Number(m[2]);
}

export function compareBlocks(a: string, b: string): number {
  return blockKey(a) - blockKey(b) || a.localeCompare(b);
}

/** Total order position of a lesson/check ID; undefined for malformed IDs. */
export function courseIndex(lessonId: string): number | undefined {
  const m = LESSON_RE.exec(lessonId);
  if (!m) return undefined;
  const block = Number(m[1]) * 100 + Number(m[2]);
  const position = m[4] ? 99 : Number(m[3]);
  return block * 1000 + position;
}

/** Negative when a precedes b in course order; 0 when equal. Malformed IDs sort last. */
export function compareLessons(a: string, b: string): number {
  const ia = courseIndex(a) ?? Number.MAX_SAFE_INTEGER;
  const ib = courseIndex(b) ?? Number.MAX_SAFE_INTEGER;
  return ia - ib || a.localeCompare(b);
}

export function blockOfLesson(lessonId: string): string | undefined {
  const m = /^(A[12]-0[1-8])-/.exec(lessonId);
  return m?.[1];
}

export function isCheckId(lessonId: string): boolean {
  return lessonId.endsWith('-C1');
}
