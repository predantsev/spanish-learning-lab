// Append-only event log (monotonic eventSeq, UTC timestamp, local date, profileEpoch, kind, entity).
import type { Db } from '../db/connection.ts';
import { canonicalJson } from '../content/pack-format.ts';

export const EVENT_SCHEMA_VERSION = 1;

export interface NewEvent {
  readonly kind: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly at: Date;
  readonly localDate: string;
  readonly epoch: number;
  readonly operationId?: string;
  readonly payload?: Record<string, unknown>;
}

export function appendEvent(db: Db, e: NewEvent): number {
  const r = db
    .prepare(
      `INSERT INTO event_log (occurred_at, local_date, profile_epoch, kind, entity_type, entity_id, schema_version, operation_id, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(e.at.toISOString(), e.localDate, e.epoch, e.kind, e.entityType, e.entityId, EVENT_SCHEMA_VERSION, e.operationId ?? null, canonicalJson(e.payload ?? {}));
  return Number(r.lastInsertRowid);
}
