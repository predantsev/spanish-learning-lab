// Server-side wiring of the recovery module (apps/server/src/recovery): the domain projection rebuild
// for imported profiles and a log adapter. Pack directories/asset files use the recovery defaults
// (packs/<packId>/<version>, assets/<rel_path>), which is exactly where content/install.ts puts them.
import { createRecovery, type RecoveryService } from './recovery/index.ts';
import type { RecoveryLogger } from './recovery/options.ts';
import type { LogSink } from './http/logging.ts';
import { rebuildSchedulerProjection } from './learning/scheduler-store.ts';
import type { ProfileStore } from './store/types.ts';

const SAFE_FIELD = /^(kind|reason|code|eventSeq|epoch|bytes|count|cmd|step|action|ms|status)$/;

/** Recovery log lines carry the message and allowlisted scalar fields only (never paths with private names, never bodies). */
export function recoveryLogger(sink: LogSink): RecoveryLogger {
  const line = (level: string) => (msg: string, fields?: Record<string, unknown>) => {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields ?? {})) if (SAFE_FIELD.test(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) safe[k] = v;
    sink.write(`${JSON.stringify({ level, time: new Date().toISOString(), component: 'recovery', msg, ...safe })}\n`);
  };
  return { info: line('info'), warn: line('warn'), error: line('error') };
}

export function createServerRecovery(store: ProfileStore, sink?: LogSink): RecoveryService {
  return createRecovery(store, {
    // Dry rebuild on the isolated import DB: the same reducer as the live incremental path; throws on a bad event.
    rebuildProjections: (db) => {
      rebuildSchedulerProjection(db);
    },
    ...(sink ? { logger: recoveryLogger(sink) } : {}),
  });
}
