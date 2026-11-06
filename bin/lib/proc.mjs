// Process identity for lock/instance checks. A PID alone is never trusted: the start time (ps lstart, forced to
// C locale + UTC so it is stable across invocations) and the command line must match what was recorded.
// Nothing here ever signals a process except kill(pid, 0), which only probes existence.
import { execFileSync } from 'node:child_process';

const PS = '/bin/ps';
const PS_ENV = { LC_ALL: 'C', LANG: 'C', TZ: 'UTC', PATH: '/usr/bin:/bin' };

export function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function ps(field, pid) {
  try {
    const out = execFileSync(PS, ['-o', `${field}=`, '-p', String(pid)], { env: PS_ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const line = out.split('\n').find((l) => l.trim() !== '');
    return line === undefined ? undefined : line.trim();
  } catch {
    return undefined;
  }
}

/** { start, command } of a live process, or undefined. */
export function processIdentity(pid) {
  if (!isAlive(pid)) return undefined;
  const start = ps('lstart', pid);
  const command = ps('command', pid);
  if (!start || command === undefined) return undefined;
  return { start, command };
}

/**
 * Liveness for lock/instance decisions: the PID is alive and started at the recorded time. Deliberately ignores
 * the command line, so a live service is never mistaken for a stale one (e.g. after a process title change);
 * a live-but-unproven process makes the launcher refuse and report, never start a second writer.
 */
export function sameProcess(pid, processStart) {
  const id = processIdentity(pid);
  return Boolean(id) && typeof processStart === 'string' && processStart !== '' && id.start === processStart;
}

/**
 * Signalling guard: `pid` is alive, started at `processStart`, and runs `executable` with `entry`.
 * The launcher signals a process only when this holds for the exact child it started.
 */
export function matchesIdentity(pid, expected) {
  const id = processIdentity(pid);
  if (!id || id.start !== expected.processStart) return false;
  if (expected.executable && !(id.command === expected.executable || id.command.startsWith(`${expected.executable} `))) return false;
  if (expected.entry && !id.command.includes(expected.entry)) return false;
  return true;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Waits until the process is gone (or no longer has the recorded identity). */
export async function waitForExit(pid, processStart, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const id = processIdentity(pid);
    if (!id || id.start !== processStart) return true;
    if (Date.now() >= deadline) return false;
    await sleep(100);
  }
}
