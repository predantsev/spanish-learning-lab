// Command execution environment and shared domain checks. Handlers run synchronously inside ONE
// SQLite transaction (no await): revision → lease → domain checks → events → projections.
import type { Block, Command, Receipt, Ref, Scope } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import type { ContentRepository } from '../content/repository.ts';
import type { Principal } from '../http/principal.ts';
import type { ServerState } from '../state.ts';
import { HttpError, conflict, notFound, unprocessable } from '../http/errors.ts';
import { appendEvent } from '../learning/events.ts';
import type { PendingSchedulerEvent } from '../learning/scheduler-store.ts';

export type CommandKind = Command['kind'];

export interface CommandEnv {
  readonly state: ServerState;
  readonly db: Db;
  readonly repo: ContentRepository;
  readonly principal: Principal;
  readonly cmd: Command;
  readonly now: Date;
  readonly tz: string;
  readonly today: string;
  readonly epoch: number;
  readonly requestId: string;
  /** Appends an event row and returns its eventSeq. */
  event(kind: string, entityType: string, entityId: string, payload?: Record<string, unknown>): number;
  /**
   * Appends an event row carrying a scheduler event (payload.scheduler) and folds it into the
   * @sll/domain projection with that row's eventSeq and the command clock; returns the eventSeq.
   */
  schedule(kind: string, entityType: string, entityId: string, pending: PendingSchedulerEvent, extra?: Record<string, unknown>): number;
  /** Marks this command as a committed learning/content/draft/preference change (backup scheduling). */
  markCommitted(kind: string): void;
}

export interface CommandResult {
  readonly entities: Ref[];
  readonly outcome: Receipt['outcome'];
  readonly route?: string;
  readonly contentHash?: string;
  readonly createdEntityId?: string;
}

/** A failed write whose side effects (e.g. a preserved recovered draft) must still commit; no receipt is stored. */
export interface CommandFailure {
  readonly failure: HttpError;
}

export type CommandHandler = (env: CommandEnv) => CommandResult | CommandFailure;

export interface Authority {
  /** Owner browser session may run it. */
  readonly owner: boolean;
  /** Agent scope that grants it (undefined: never for agents). */
  readonly scope?: Scope;
}

export const AUTHORITY: Record<CommandKind, Authority | 'privileged'> = {
  'session.start': { owner: true },
  'session.finish': { owner: true },
  'lesson.progress': { owner: true },
  'phrase.archive': { owner: true },
  'context.open': { owner: true },
  'context.activity': { owner: true },
  'context.close': { owner: true },
  'draft.save': { owner: true },
  'attempt.submit': { owner: true },
  'support.observe': { owner: true },
  'support.prepare': { owner: true, scope: 'help:write' },
  'support.request': { owner: true },
  'support.confirm': { owner: true, scope: 'help:write' },
  'support.cancel': { owner: true, scope: 'help:write' },
  'practice.create': { owner: true, scope: 'practice:write' },
  'phrase.capture': { owner: true, scope: 'draft:write' },
  'material.draft': { owner: true, scope: 'draft:write' },
  'collection.create': { owner: true, scope: 'draft:write' },
  'collection.patch': { owner: true, scope: 'draft:write' },
  'preference.set': { owner: true, scope: 'preference:write' },
  'review.submit': { owner: true, scope: 'draft:write' },
  'review.validate': 'privileged',
  'content.promote': 'privileged',
  'profile.timezone-preview': { owner: true },
  'profile.settings': { owner: true },
};

export function mayRun(principal: Principal, kind: CommandKind): boolean {
  const a = AUTHORITY[kind];
  if (a === 'privileged') return false;
  if (principal.kind === 'owner') return a.owner;
  return a.scope !== undefined && principal.scopes.has(a.scope);
}

export function allowedKinds(principal: Principal): string[] {
  return (Object.keys(AUTHORITY) as CommandKind[]).filter((k) => mayRun(principal, k));
}

/** If-Match/expectedRevision against the subject's current revision (0 = must not exist yet). */
export function requireRevision(current: number, expected: number): void {
  if (current !== expected) throw conflict('STALE_REVISION', current);
}

export function requireLease(env: CommandEnv, contextId: string, contextRevision: number): void {
  const result = env.state.leases.check(
    (env.cmd as { contextSnapshot?: string }).contextSnapshot,
    { instanceId: env.state.store.instanceId, principalKey: env.principal.key, epoch: env.epoch, contextId, contextRevision },
    env.now,
  );
  if (result !== 'ok') throw conflict('SNAPSHOT_INVALID');
}

export interface ContextRow {
  id: string;
  revision: number;
  session_id: string;
  task_revision_id: string;
  open: number;
  title: string;
  mode: 'learn' | 'practice' | 'review' | 'listening';
  last_activity_at: string;
  last_typing_at: string | null;
  created_at: string;
  closed_at: string | null;
}

export function loadContext(db: Db, id: string): ContextRow {
  const r = db.prepare('SELECT * FROM contexts WHERE id = ?').get(id) as ContextRow | undefined;
  if (!r) throw notFound('CONTEXT_NOT_FOUND');
  return r;
}

export interface DraftRow {
  id: string;
  revision: number;
  context_id: string;
  task_revision_id: string;
  text: string;
  cursor: number;
  recovered_from_operation_id: string | null;
  saved_at: string;
}

/** The context's active draft (recovered drafts are kept separately and never become active silently). */
export function activeDraft(db: Db, contextId: string): DraftRow | undefined {
  return db
    .prepare('SELECT * FROM drafts WHERE context_id = ? AND recovered_from_operation_id IS NULL ORDER BY saved_at DESC, rowid DESC LIMIT 1')
    .get(contextId) as DraftRow | undefined;
}

/** Active-context commands carry contextId/contextRevision; the context revision must be current, then the lease must match. */
export function requireActiveContext(env: CommandEnv, contextId: string): ContextRow {
  const c = env.cmd as { contextId?: string; contextRevision?: number };
  if (c.contextId === undefined || c.contextRevision === undefined) throw unprocessable('CONTEXT_REQUIRED');
  if (c.contextId.toLowerCase() !== contextId.toLowerCase()) throw unprocessable('CONTEXT_MISMATCH');
  const ctx = loadContext(env.db, contextId);
  if (c.contextRevision !== ctx.revision) throw conflict('STALE_REVISION', ctx.revision);
  requireLease(env, ctx.id, ctx.revision);
  if (ctx.open !== 1) throw unprocessable('CONTEXT_CLOSED');
  return ctx;
}

export const MATERIAL_MAX_CHARS = 20_000;

/** Typed block checks beyond the schema: table row widths equal the column count; returns total text length. */
export function checkBlocks(blocks: readonly Block[]): number {
  let chars = 0;
  for (const b of blocks) {
    switch (b.type) {
      case 'paragraph':
        chars += b.text.length;
        break;
      case 'bullet-list':
        chars += b.items.reduce((n, s) => n + s.length, 0);
        break;
      case 'example':
        chars += b.spanish.length + b.ukrainian.length;
        break;
      case 'practice-link':
        chars += b.labelUk.length;
        break;
      case 'table':
        for (const row of b.rows) if (row.length !== b.columns.length) throw unprocessable('TABLE_WIDTH');
        chars += b.columns.reduce((n, s) => n + s.length, 0) + b.rows.reduce((n, r) => n + r.reduce((m, s) => m + s.length, 0), 0);
        break;
    }
  }
  return chars;
}

export function ref(id: string, revision: number, resourceType: Ref['resourceType']): Ref {
  return { id, revision, resourceType };
}

export function failure(err: HttpError): CommandFailure {
  return { failure: err };
}

export function isFailure(x: CommandResult | CommandFailure): x is CommandFailure {
  return 'failure' in x;
}

export function eventFn(db: Db, base: { at: Date; localDate: string; epoch: number; operationId: string }): (kind: string, entityType: string, entityId: string, payload?: Record<string, unknown>) => number {
  return (kind, entityType, entityId, payload) => appendEvent(db, { kind, entityType, entityId, at: base.at, localDate: base.localDate, epoch: base.epoch, operationId: base.operationId, ...(payload ? { payload } : {}) });
}
