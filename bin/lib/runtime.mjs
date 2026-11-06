// runtime/runtime.json (0600): { schemaVersion, instanceId, url, pid, processStart, profileEpoch, startedAt }.
// Never a token, nonce or IPC secret. runtime/last-port remembers the prior port for reuse on restart.
import { readFileSync } from 'node:fs';
import { readJson, removeQuiet, writeFileAtomic, writeJsonAtomic } from './fsx.mjs';

export const RUNTIME_SCHEMA_VERSION = 1;
export const HOST = 'spanish-learning-lab.localhost';
export const LOOPBACK = '127.0.0.1';

export function readRuntime(lp) {
  const r = readJson(lp.runtimeJson);
  return r && r.schemaVersion === RUNTIME_SCHEMA_VERSION && Number.isInteger(r.pid) ? r : undefined;
}

export function writeRuntime(lp, record) {
  const { schemaVersion, instanceId, url, pid, processStart, profileEpoch, startedAt } = record;
  writeJsonAtomic(lp.runtimeJson, { schemaVersion, instanceId, url, pid, processStart, profileEpoch, startedAt });
}

export function removeRuntime(lp) {
  removeQuiet(lp.runtimeJson);
}

export function readLastPort(lp) {
  try {
    const n = Number(readFileSync(lp.lastPort, 'utf8').trim());
    return Number.isInteger(n) && n > 0 && n < 65536 ? n : undefined;
  } catch {
    return undefined;
  }
}

export function writeLastPort(lp, port) {
  writeFileAtomic(lp.lastPort, `${port}\n`);
}

export function appUrl(port, { loopback = false } = {}) {
  return `http://${loopback ? LOOPBACK : HOST}:${port}`;
}
