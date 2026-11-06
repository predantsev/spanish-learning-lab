// Server-side handlers for the launcher's recovery IPC verbs (proposal; the IPC server itself belongs to
// server-core main.ts). The IPC caller is the owner-equivalent local launcher authenticated by runtime/ipc.key,
// never an agent token, so it may name an archive path on this Mac. Arguments are validated strictly.
import { createReadStream, lstatSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { RecoveryError, type Recovery, type RestoreOutcome } from './types.ts';

export type IpcHandler = (args: unknown) => Promise<unknown>;

export interface RecoveryIpcDeps {
  /** Called after a committed restore: the server must drop in-memory sessions, nonces and snapshot leases. */
  readonly onRestored?: (outcome: RestoreOutcome) => void | Promise<void>;
}

function args(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new RecoveryError('IPC_BAD_ARGS', 400, 'arguments must be an object');
  const o = value as Record<string, unknown>;
  const allowed = new Set([...required, ...optional]);
  for (const k of Object.keys(o)) if (!allowed.has(k)) throw new RecoveryError('IPC_BAD_ARGS', 400, `unexpected argument ${k}`);
  for (const k of required) if (!(k in o)) throw new RecoveryError('IPC_BAD_ARGS', 400, `missing argument ${k}`);
  return o;
}

function str(v: unknown, name: string, max = 256): string {
  if (typeof v !== 'string' || v.length === 0 || v.length > max) throw new RecoveryError('IPC_BAD_ARGS', 400, `${name} must be a non-empty string`);
  return v;
}

export function createRecoveryIpcHandlers(recovery: Recovery, deps: RecoveryIpcDeps = {}): Record<'backup' | 'export' | 'restore-preview' | 'restore-confirm', IpcHandler> {
  return {
    async backup(raw) {
      const a = args(raw ?? {}, [], ['reason']);
      const reason = a.reason === undefined ? 'launcher' : str(a.reason, 'reason', 64);
      if (!/^[a-z0-9-]+$/.test(reason)) throw new RecoveryError('IPC_BAD_ARGS', 400, 'reason must be a lowercase slug');
      return recovery.backupNow('manual', reason);
    },
    async export(raw) {
      const a = args(raw, ['selfContained']);
      if (typeof a.selfContained !== 'boolean') throw new RecoveryError('IPC_BAD_ARGS', 400, 'selfContained must be a boolean');
      return recovery.exportProfile({ selfContained: a.selfContained });
    },
    async 'restore-preview'(raw) {
      const a = args(raw, ['archivePath']);
      const archivePath = str(a.archivePath, 'archivePath', 4096);
      if (!isAbsolute(archivePath)) throw new RecoveryError('IPC_BAD_ARGS', 400, 'archivePath must be absolute');
      let regular = false;
      try {
        regular = lstatSync(archivePath).isFile();
      } catch {
        regular = false;
      }
      if (!regular) throw new RecoveryError('ARCHIVE_NOT_FOUND', 422, 'archive is not a regular file');
      const upload = await recovery.storeUpload(createReadStream(archivePath));
      return recovery.previewRestore(upload.id);
    },
    async 'restore-confirm'(raw) {
      const a = args(raw, ['operationId', 'previewId', 'archiveHash', 'confirmation', 'trustImportedProvenance']);
      if (typeof a.trustImportedProvenance !== 'boolean') throw new RecoveryError('IPC_BAD_ARGS', 400, 'trustImportedProvenance must be a boolean');
      const outcome = await recovery.confirmRestore({
        operationId: str(a.operationId, 'operationId', 128),
        previewId: str(a.previewId, 'previewId', 64),
        archiveHash: str(a.archiveHash, 'archiveHash', 64),
        confirmation: str(a.confirmation, 'confirmation', 128),
        trustImportedProvenance: a.trustImportedProvenance,
      });
      await deps.onRestored?.(outcome);
      return outcome;
    },
  };
}
