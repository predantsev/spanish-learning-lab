// Launcher log: JSON lines in <root>/logs, rotated at 5 MiB keeping 3 files (current, .1, .2).
// Records command names, outcome codes, PIDs and ports only — never nonces, tokens, secrets or confirmations.
import { appendFileSync, existsSync, renameSync, statSync } from 'node:fs';
import { removeQuiet } from './fsx.mjs';

export const LOG_MAX_BYTES = 5 * 1024 * 1024;
export const LOG_FILES = 3;
const SECRET_KEY = /token|nonce|secret|confirmation|cookie|password|key/i;

export function rotateIfNeeded(file, maxBytes = LOG_MAX_BYTES, files = LOG_FILES) {
  let size = 0;
  try {
    size = statSync(file).size;
  } catch {
    return;
  }
  if (size < maxBytes) return;
  removeQuiet(`${file}.${files - 1}`);
  for (let i = files - 2; i >= 1; i--) if (existsSync(`${file}.${i}`)) renameSync(`${file}.${i}`, `${file}.${i + 1}`);
  renameSync(file, `${file}.1`);
}

export function createLogger(file) {
  const write = (level, msg, fields = {}) => {
    const safe = {};
    for (const [k, v] of Object.entries(fields)) if (!SECRET_KEY.test(k)) safe[k] = v;
    try {
      rotateIfNeeded(file);
      appendFileSync(file, `${JSON.stringify({ t: new Date().toISOString(), level, msg, ...safe })}\n`, { mode: 0o600 });
    } catch {
      /* logging must never break the launcher */
    }
  };
  return {
    info: (msg, fields) => write('info', msg, fields),
    warn: (msg, fields) => write('warn', msg, fields),
    error: (msg, fields) => write('error', msg, fields),
  };
}
