// Mutation receipts: scoped by profile + operationId, kept permanently (exported with the profile).
// Same operation/kind/canonical body → the original receipt; different kind/body → 409.
import type { Receipt } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import { canonicalJson, sha256Hex } from '../content/pack-format.ts';

export interface StoredReceipt {
  readonly operationId: string;
  readonly kind: string;
  readonly bodyDigest: string;
  readonly principal: string;
  readonly profileEpoch: number;
  readonly receipt: Receipt;
  readonly createdEntityId: string | null;
  readonly createdAt: string;
}

interface Row {
  operation_id: string;
  kind: string;
  body_digest: string;
  principal: string;
  profile_epoch: number;
  receipt: string;
  created_entity_id: string | null;
  created_at: string;
}

export function bodyDigest(body: unknown): string {
  return sha256Hex(canonicalJson(body));
}

export function findReceipt(db: Db, operationId: string): StoredReceipt | undefined {
  const r = db.prepare('SELECT * FROM mutation_receipts WHERE operation_id = ?').get(operationId.toLowerCase()) as Row | undefined;
  if (!r) return undefined;
  return {
    operationId: r.operation_id,
    kind: r.kind,
    bodyDigest: r.body_digest,
    principal: r.principal,
    profileEpoch: r.profile_epoch,
    receipt: JSON.parse(r.receipt) as Receipt,
    createdEntityId: r.created_entity_id,
    createdAt: r.created_at,
  };
}

export function storeReceipt(db: Db, r: Omit<StoredReceipt, 'createdAt'> & { readonly at: Date }): void {
  db.prepare(
    'INSERT INTO mutation_receipts (operation_id, kind, body_digest, principal, profile_epoch, receipt, created_entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(r.operationId.toLowerCase(), r.kind, r.bodyDigest, r.principal, r.profileEpoch, JSON.stringify(r.receipt), r.createdEntityId, r.at.toISOString());
}

/** The principal that created an entity (through the receipt of its creating write), if recorded. */
export function creatorOf(db: Db, entityId: string): string | undefined {
  const r = db.prepare('SELECT principal FROM mutation_receipts WHERE created_entity_id = ? ORDER BY created_at LIMIT 1').get(entityId) as { principal: string } | undefined;
  return r?.principal;
}
