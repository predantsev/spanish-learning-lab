// Launcher ⇄ service IPC client.
//
// Protocol proposal v1 (the server side belongs to apps/server/src/main.ts, owned by the server-core worker;
// tests/integration/launcher-stub-server.mjs is a reference implementation):
// - Transport: Unix domain socket <runtime>/ipc.sock (0600, inside the 0700 runtime dir). macOS limits the
//   socket path to 104 bytes; the default private root keeps it near 90 for typical user names.
// - Secret: <runtime>/ipc.key (0600) = 64 hex chars from 32 random bytes, written by the service before it
//   listens and rotated on every start. It is never logged and never placed in runtime.json.
// - Framing: one UTF-8 JSON object per line (\n), at most 64 KiB; one request and one response per connection.
// - Request:  {"v":1,"id":"<uuid>","secret":"<ipc.key>","verb":"<verb>","args":{...}}
// - Response: {"v":1,"id":"<same>","ok":true,"result":{...}}
//             {"v":1,"id":"<same>","ok":false,"error":{"code":"...","message":"...","status":409,"retryable":false}}
//   Wrong/missing secret → error IPC_UNAUTHORIZED and the connection is closed; unknown verb → IPC_UNKNOWN_VERB.
// - Verbs:
//   status          {} → {instanceId,pid,port,profileId,profileEpoch,schemaVersion,startedAt,maintenance:{on,reason?},lastRestoreOperationId|null}
//   register-nonce  {nonce} → {expiresAt}   nonce = 32 random bytes base64url; the service keeps only its hash, 60 s, one use
//   stop            {} → {stopping:true}     respond first, then close HTTP, recovery.stop() (flush), checkpoint, exit 0
//   backup          {reason?} → BackupRecordInfo          (apps/server/src/recovery/ipc-handlers.ts)
//   export          {selfContained} → ArtifactInfo         (path inside <root>/exports, 15 min)
//   restore-preview {archivePath} → RestorePreviewInfo     (absolute path of a local archive)
//   restore-confirm {operationId,previewId,archiveHash,confirmation,trustImportedProvenance} → RestoreOutcome
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { connect } from 'node:net';

export const IPC_VERSION = 1;
const MAX_LINE = 64 * 1024;

export class IpcError extends Error {
  constructor(code, message, { status, retryable = false, transport = false } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    /** True when the request may or may not have reached the service (no response was read). */
    this.transport = transport;
  }
}

function readSecret(lp) {
  try {
    const s = readFileSync(lp.ipcKey, 'utf8').trim();
    if (!/^[0-9a-f]{64}$/.test(s)) throw new Error('bad key');
    return s;
  } catch {
    throw new IpcError('IPC_UNAVAILABLE', 'service IPC key is not available', { transport: true });
  }
}

export function ipcRequest(lp, verb, args = {}, { timeoutMs = 10_000 } = {}) {
  const secret = readSecret(lp);
  const id = randomUUID();
  return new Promise((resolve, reject) => {
    let settled = false;
    let sent = false;
    let buf = '';
    const socket = connect(lp.ipcSock);
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      fn();
    };
    const timer = setTimeout(
      () => finish(() => reject(new IpcError(sent ? 'IPC_TIMEOUT' : 'IPC_UNAVAILABLE', `no IPC response to ${verb}`, { transport: true }))),
      timeoutMs,
    );
    socket.setEncoding('utf8');
    socket.on('connect', () => {
      sent = true;
      socket.write(`${JSON.stringify({ v: IPC_VERSION, id, secret, verb, args })}\n`);
    });
    socket.on('data', (chunk) => {
      buf += chunk;
      if (buf.length > MAX_LINE) return finish(() => reject(new IpcError('IPC_PROTOCOL', 'IPC response too large', { transport: true })));
      const nl = buf.indexOf('\n');
      if (nl === -1) return;
      let msg;
      try {
        msg = JSON.parse(buf.slice(0, nl));
      } catch {
        return finish(() => reject(new IpcError('IPC_PROTOCOL', 'malformed IPC response', { transport: true })));
      }
      if (msg.id !== id || msg.v !== IPC_VERSION) return finish(() => reject(new IpcError('IPC_PROTOCOL', 'unexpected IPC response', { transport: true })));
      if (msg.ok) return finish(() => resolve(msg.result));
      const e = msg.error ?? {};
      finish(() => reject(new IpcError(e.code ?? 'IPC_ERROR', e.message ?? 'service error', { status: e.status, retryable: e.retryable === true })));
    });
    socket.on('error', () =>
      finish(() => reject(new IpcError(sent ? 'IPC_NO_RESPONSE' : 'IPC_UNAVAILABLE', `IPC connection failed for ${verb}`, { transport: true }))),
    );
    socket.on('close', () => finish(() => reject(new IpcError(sent ? 'IPC_NO_RESPONSE' : 'IPC_UNAVAILABLE', `IPC closed without a response to ${verb}`, { transport: true }))));
  });
}
