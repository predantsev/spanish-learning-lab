#!/usr/bin/env node
// Spanish Learning Lab launcher (plain JavaScript ESM, runs with the project/bundled Node; no global changes).
// IMPLEMENTATION-PLAN §Architecture and local delivery: private root (SLL_HOME override), exclusive profile lock,
// runtime.json without secrets, prior-port reuse, one detached child whose PID/start identity is recorded,
// IPC to the own instance only, and never a kill by port or name.
//
// Environment (diagnostics/tests): SLL_HOME, SLL_SERVER_ENTRY (server entry path),
// SLL_OPEN_COMMAND (browser opener, default /usr/bin/open), SLL_START_TIMEOUT_MS (30000), SLL_STOP_TIMEOUT_MS (15000).
import { spawn } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { chmodSync, closeSync, constants, copyFileSync, createReadStream, existsSync, lstatSync, openSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readJson, removeQuiet } from './lib/fsx.mjs';
import { IpcError, ipcRequest } from './lib/ipc.mjs';
import { acquireLock, clearStaleLock, LOCK_SCHEMA_VERSION, readLock, releaseLock, replaceLock } from './lib/lock.mjs';
import { createLogger, rotateIfNeeded } from './lib/log.mjs';
import { uk } from './lib/messages.mjs';
import { ensurePrivateDirs, launcherPaths, resolvePrivateRoot } from './lib/paths.mjs';
import { matchesIdentity, processIdentity, sameProcess, sleep, waitForExit } from './lib/proc.mjs';
import { appUrl, readLastPort, readRuntime, removeRuntime, RUNTIME_SCHEMA_VERSION, writeLastPort, writeRuntime } from './lib/runtime.mjs';

const SELF = fileURLToPath(import.meta.url);
const APP_ROOT = resolve(dirname(SELF), '..');
const OFFLINE_MODULE = join(APP_ROOT, 'apps', 'server', 'src', 'recovery', 'offline.ts');
const PREVIEW_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const EXIT_NOT_RUNNING = 3;

class CliError extends Error {
  constructor(code, message, exitCode = EXIT_FAIL) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
  }
}

const envMs = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// ---------------------------------------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------------------------------------

const BOOLEAN_FLAGS = new Set(['--open', '--foreground', '--loopback', '--json', '--self-contained', '--trust-imported-provenance', '--help']);
const VALUE_FLAGS = new Set(['--out', '--preview', '--confirm', '--token']);

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const flags = new Set();
  const values = new Map();
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (BOOLEAN_FLAGS.has(a)) flags.add(a);
    else if (VALUE_FLAGS.has(a)) {
      const v = rest[i + 1];
      if (v === undefined || v.startsWith('--')) throw new CliError('USAGE', `${a} needs a value`, EXIT_USAGE);
      values.set(a, v);
      i++;
    } else throw new CliError('USAGE', `unknown argument ${a}`, EXIT_USAGE);
  }
  return { cmd, flags, values, json: flags.has('--json') };
}

// ---------------------------------------------------------------------------------------------------------
// Context and output
// ---------------------------------------------------------------------------------------------------------

function context() {
  const root = resolvePrivateRoot();
  const paths = ensurePrivateDirs(root);
  const lp = launcherPaths(paths);
  return { root, paths, lp, log: createLogger(lp.launcherLog) };
}

function emit(json, human, data) {
  if (json) process.stdout.write(`${JSON.stringify(data)}\n`);
  else if (human) process.stdout.write(`${human}\n`);
}

function note(json, human) {
  if (!json) process.stderr.write(`${human}\n`);
}

// ---------------------------------------------------------------------------------------------------------
// Instance discovery
// ---------------------------------------------------------------------------------------------------------

/** state: running | unresponsive | stale | none. Liveness is PID + start time; IPC proves it is our instance. */
async function findInstance(ctx) {
  const rt = readRuntime(ctx.lp);
  const lock = readLock(ctx.lp.lock);
  if (!rt) {
    if (lock && lock.role === 'service' && sameProcess(lock.pid, lock.processStart)) {
      try {
        const st = await ipcRequest(ctx.lp, 'status', {}, { timeoutMs: 3000 });
        if (st.instanceId === lock.instanceId) return { state: 'running', lock, status: st, pid: lock.pid };
      } catch {
        /* fall through */
      }
      return { state: 'unresponsive', lock, pid: lock.pid };
    }
    return { state: 'none', lock };
  }
  if (!sameProcess(rt.pid, rt.processStart)) return { state: 'stale', runtime: rt, lock, pid: rt.pid };
  try {
    const st = await ipcRequest(ctx.lp, 'status', {}, { timeoutMs: 3000 });
    if (st.instanceId === rt.instanceId && st.pid === rt.pid) return { state: 'running', runtime: rt, lock, status: st, pid: rt.pid };
  } catch {
    /* fall through */
  }
  return { state: 'unresponsive', runtime: rt, lock, pid: rt.pid };
}

/** Removes records of a process that is gone. Never signals anything; never touches a live holder's lock. */
function cleanupStale(ctx) {
  removeRuntime(ctx.lp);
  if (clearStaleLock(ctx.lp.lock)) {
    removeQuiet(ctx.lp.ipcSock);
    removeQuiet(ctx.lp.ipcKey);
  }
}

/** Expected identity of the service process, from runtime.json + the lock that names the same PID. */
function serviceIdentity(inst) {
  const pid = inst.pid;
  const lock = inst.lock && inst.lock.pid === pid && inst.lock.role === 'service' ? inst.lock : undefined;
  return {
    pid,
    instanceId: inst.runtime?.instanceId ?? lock?.instanceId,
    processStart: inst.runtime?.processStart ?? lock?.processStart,
    executable: lock?.executable,
    entry: lock?.entry,
  };
}

/**
 * Stops the service: IPC first; if it is still running after the timeout, signal ONLY that exact PID and only
 * when its start time, executable and entry still match what this launcher recorded. Returns { gone, forced }.
 */
async function stopProcess(ctx, id, { viaIpc }) {
  if (viaIpc) {
    try {
      await ipcRequest(ctx.lp, 'stop', {}, { timeoutMs: 5000 });
    } catch {
      /* fall back to waiting */
    }
  }
  let gone = await waitForExit(id.pid, id.processStart, envMs('SLL_STOP_TIMEOUT_MS', 15_000));
  if (gone) return { gone, forced: false };
  if (!id.executable || !id.entry || !matchesIdentity(id.pid, id)) return { gone: false, forced: false, refused: true };
  for (const signal of ['SIGTERM', 'SIGKILL']) {
    if (!matchesIdentity(id.pid, id)) break;
    try {
      process.kill(id.pid, signal);
    } catch {
      /* already gone */
    }
    ctx.log.warn('service did not stop via IPC; signalled own child', { cmd: 'stop', pid: id.pid, signal });
    gone = await waitForExit(id.pid, id.processStart, 5000);
    if (gone) break;
  }
  return { gone, forced: true };
}

function releaseServiceRecords(ctx, id) {
  const rt = readRuntime(ctx.lp);
  if (rt && rt.pid === id.pid) removeRuntime(ctx.lp);
  releaseLock(ctx.lp.lock, { pid: id.pid, instanceId: id.instanceId });
  if (!readLock(ctx.lp.lock)) {
    removeQuiet(ctx.lp.ipcSock);
    removeQuiet(ctx.lp.ipcKey);
  }
}

// ---------------------------------------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------------------------------------

async function openBrowser(ctx, port, { loopback, json }) {
  const nonce = randomBytes(32).toString('base64url');
  await ipcRequest(ctx.lp, 'register-nonce', { nonce }, { timeoutMs: 5000 });
  const url = `${appUrl(port, { loopback })}/#n=${nonce}`;
  const opener = process.env.SLL_OPEN_COMMAND || '/usr/bin/open';
  const child = spawn(opener, [url], { stdio: 'ignore', detached: true });
  child.on('error', () => ctx.log.error('browser opener failed', { cmd: 'open' }));
  child.unref();
  ctx.log.info('browser opened', { cmd: 'open', port, loopback });
  note(json, uk.opening);
  if (!loopback) note(json, uk.fallback(port));
}

// ---------------------------------------------------------------------------------------------------------
// start / status / open / stop
// ---------------------------------------------------------------------------------------------------------

async function waitForReady(ctx, child, exitState, instanceId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (exitState.exited) throw new CliError('START_FAILED', `service exited during startup (code ${exitState.code})`);
    if (existsSync(ctx.lp.ipcKey) && existsSync(ctx.lp.ipcSock)) {
      try {
        const st = await ipcRequest(ctx.lp, 'status', {}, { timeoutMs: 1000 });
        if (st.instanceId === instanceId && st.pid === child.pid) return st;
      } catch {
        /* not ready yet */
      }
    }
    await sleep(100);
  }
  throw new CliError('START_TIMEOUT', 'service did not become ready in time');
}

async function cmdStart(ctx, a) {
  const json = a.json;
  const fg = a.flags.has('--foreground');
  const inst = await findInstance(ctx);
  if (inst.state === 'running') {
    const url = appUrl(inst.status.port);
    ctx.log.info('start: instance already running', { cmd: 'start', pid: inst.pid });
    emit(json, uk.alreadyRunning(url), { state: 'already-running', url, pid: inst.pid, instanceId: inst.status.instanceId, port: inst.status.port });
    if (a.flags.has('--open')) await openBrowser(ctx, inst.status.port, { loopback: a.flags.has('--loopback'), json });
    return EXIT_OK;
  }
  if (inst.state === 'unresponsive') throw new CliError('SERVICE_UNRESPONSIVE', uk.unresponsive(inst.pid, ctx.paths.logs));
  if (inst.state === 'stale') {
    cleanupStale(ctx);
    note(json, uk.staleCleaned(inst.pid));
  }
  const entry = process.env.SLL_SERVER_ENTRY ? resolve(process.env.SLL_SERVER_ENTRY) : join(APP_ROOT, 'apps', 'server', 'src', 'main.ts');
  if (!existsSync(entry)) throw new CliError('ENTRY_MISSING', uk.entryMissing(entry));

  const instanceId = randomUUID();
  const self = processIdentity(process.pid);
  const launcherLock = { schemaVersion: LOCK_SCHEMA_VERSION, pid: process.pid, processStart: self?.start ?? '', instanceId, role: 'launcher', createdAt: new Date().toISOString() };
  let got = acquireLock(ctx.lp.lock, launcherLock);
  const lockDeadline = Date.now() + envMs('SLL_START_TIMEOUT_MS', 30_000);
  while (!got.ok) {
    // Another launcher may be starting the service, or an offline command holds the profile: wait, then reuse
    // the instance it started or take the lock once it is released.
    const other = await findInstance(ctx);
    if (other.state === 'running') {
      emit(json, uk.alreadyRunning(appUrl(other.status.port)), { state: 'already-running', url: appUrl(other.status.port), pid: other.pid, instanceId: other.status.instanceId, port: other.status.port });
      if (a.flags.has('--open')) await openBrowser(ctx, other.status.port, { loopback: a.flags.has('--loopback'), json });
      return EXIT_OK;
    }
    if (Date.now() >= lockDeadline) throw new CliError('PROFILE_LOCKED', uk.locked(got.holder?.pid ?? '?'));
    await sleep(200);
    got = acquireLock(ctx.lp.lock, launcherLock);
  }

  // This launcher now owns the profile: anything left in runtime/ belongs to a previous, dead instance.
  removeQuiet(ctx.lp.ipcSock);
  removeQuiet(ctx.lp.ipcKey);
  removeRuntime(ctx.lp);
  const port = readLastPort(ctx.lp) ?? 0;
  let child;
  let childId;
  let readyPort;
  const exitState = { exited: false, code: null };
  try {
    rotateIfNeeded(ctx.lp.serviceLog);
    const outFd = fg ? null : openSync(ctx.lp.serviceLog, 'a', 0o600);
    try {
      child = spawn(process.execPath, [entry], {
        cwd: APP_ROOT,
        detached: !fg,
        stdio: fg ? 'inherit' : ['ignore', outFd, outFd],
        env: { ...process.env, SLL_HOME: ctx.root, SLL_PORT: String(port), SLL_INSTANCE_ID: instanceId },
      });
    } finally {
      if (outFd !== null) closeSync(outFd);
    }
    child.once('exit', (code, signal) => {
      exitState.exited = true;
      exitState.code = code ?? signal;
    });
    const started = processIdentity(child.pid);
    if (!started) throw new CliError('START_FAILED', 'service exited immediately');
    childId = { pid: child.pid, processStart: started.start, executable: process.execPath, entry, instanceId };
    replaceLock(ctx.lp.lock, { schemaVersion: LOCK_SCHEMA_VERSION, ...childId, role: 'service', createdAt: new Date().toISOString() });
    const status = await waitForReady(ctx, child, exitState, instanceId, envMs('SLL_START_TIMEOUT_MS', 30_000));
    const url = appUrl(status.port);
    writeRuntime(ctx.lp, {
      schemaVersion: RUNTIME_SCHEMA_VERSION,
      instanceId,
      url,
      pid: child.pid,
      processStart: started.start,
      profileEpoch: status.profileEpoch,
      startedAt: status.startedAt ?? new Date().toISOString(),
    });
    writeLastPort(ctx.lp, status.port);
    ctx.log.info('service started', { cmd: 'start', pid: child.pid, port: status.port, reusedPort: port !== 0 && port === status.port });
    emit(json, uk.started(url), { state: 'started', url, pid: child.pid, instanceId, port: status.port });
    readyPort = status.port;
  } catch (err) {
    ctx.log.error('start failed', { cmd: 'start', code: err.code });
    if (child && childId && !exitState.exited) await stopProcess(ctx, childId, { viaIpc: true });
    removeRuntime(ctx.lp);
    releaseLock(ctx.lp.lock, { pid: process.pid, instanceId });
    if (child) releaseLock(ctx.lp.lock, { pid: child.pid, instanceId });
    throw err instanceof CliError ? new CliError(err.code, `${err.message}. ${uk.startFailed(ctx.paths.logs)}`) : err;
  }
  // The service is up; a browser that fails to open never stops it.
  if (a.flags.has('--open')) {
    try {
      await openBrowser(ctx, readyPort, { loopback: a.flags.has('--loopback'), json });
    } catch (err) {
      ctx.log.warn('browser open failed after start', { cmd: 'start', code: err.code });
      note(json, uk.failed(err.code ?? 'OPEN_FAILED', err.message));
    }
  }
  if (!fg) {
    child.unref();
    return EXIT_OK;
  }
  // Foreground diagnosis mode: stay attached; Ctrl+C asks the service to stop gracefully.
  const onSignal = () => {
    ipcRequest(ctx.lp, 'stop', {}, { timeoutMs: 3000 }).catch(() => undefined);
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  while (!exitState.exited) await sleep(200);
  releaseServiceRecords(ctx, childId);
  return typeof exitState.code === 'number' ? exitState.code : EXIT_FAIL;
}

async function cmdStatus(ctx, a) {
  const inst = await findInstance(ctx);
  if (inst.state === 'running') {
    const st = inst.status;
    const url = appUrl(st.port);
    const human = [uk.alreadyRunning(url), `  PID: ${st.pid}`, `  Епоха профілю: ${st.profileEpoch}`, `  Запущено: ${st.startedAt}`].join('\n');
    emit(a.json, human, { running: true, state: 'running', url, pid: st.pid, instanceId: st.instanceId, port: st.port, profileEpoch: st.profileEpoch, startedAt: st.startedAt, maintenance: st.maintenance ?? { on: false } });
    return EXIT_OK;
  }
  if (inst.state === 'unresponsive') {
    emit(a.json, uk.unresponsive(inst.pid, ctx.paths.logs), { running: false, state: 'unresponsive', pid: inst.pid });
    return EXIT_FAIL;
  }
  emit(a.json, uk.notRunning, { running: false, state: inst.state === 'stale' ? 'stale' : 'not-running' });
  return EXIT_NOT_RUNNING;
}

async function cmdOpen(ctx, a) {
  const inst = await findInstance(ctx);
  if (inst.state !== 'running') {
    emit(a.json, uk.notRunning, { opened: false, state: inst.state });
    return EXIT_NOT_RUNNING;
  }
  await openBrowser(ctx, inst.status.port, { loopback: a.flags.has('--loopback'), json: a.json });
  emit(a.json, null, { opened: true, port: inst.status.port, loopback: a.flags.has('--loopback') });
  return EXIT_OK;
}

async function cmdStop(ctx, a) {
  const inst = await findInstance(ctx);
  if (inst.state === 'none') {
    if (inst.lock && clearStaleLock(ctx.lp.lock)) {
      removeQuiet(ctx.lp.ipcSock);
      removeQuiet(ctx.lp.ipcKey);
    }
    emit(a.json, uk.notRunning, { state: 'not-running' });
    return EXIT_OK;
  }
  if (inst.state === 'stale') {
    cleanupStale(ctx);
    emit(a.json, `${uk.staleCleaned(inst.pid)}\n${uk.notRunning}`, { state: 'not-running', staleCleaned: true });
    return EXIT_OK;
  }
  const id = serviceIdentity(inst);
  const r = await stopProcess(ctx, id, { viaIpc: inst.state === 'running' });
  if (r.refused) throw new CliError('REFUSED_TO_SIGNAL', uk.refuseKill(id.pid));
  if (!r.gone) throw new CliError('STOP_FAILED', uk.refuseKill(id.pid));
  releaseServiceRecords(ctx, id);
  ctx.log.info('service stopped', { cmd: 'stop', pid: id.pid, forced: r.forced });
  emit(a.json, r.forced ? uk.stoppedForced(id.pid) : uk.stopped, { state: 'stopped', pid: id.pid, forced: r.forced });
  return EXIT_OK;
}

// ---------------------------------------------------------------------------------------------------------
// backup / export / restore — via IPC when running, offline under the profile lock when stopped
// ---------------------------------------------------------------------------------------------------------

async function withProfile(ctx, online, offline) {
  const inst = await findInstance(ctx);
  if (inst.state === 'running') return { mode: 'online', value: await online(inst) };
  if (inst.state === 'unresponsive') throw new CliError('SERVICE_UNRESPONSIVE', uk.unresponsive(inst.pid, ctx.paths.logs));
  if (inst.state === 'stale') cleanupStale(ctx);
  const instanceId = randomUUID();
  const self = processIdentity(process.pid);
  const got = acquireLock(ctx.lp.lock, { schemaVersion: LOCK_SCHEMA_VERSION, pid: process.pid, processStart: self?.start ?? '', instanceId, role: 'offline', createdAt: new Date().toISOString() });
  if (!got.ok) throw new CliError('PROFILE_LOCKED', uk.locked(got.holder?.pid ?? '?'));
  try {
    const mod = await import(pathToFileURL(OFFLINE_MODULE).href);
    return { mode: 'offline', value: await offline(mod) };
  } finally {
    releaseLock(ctx.lp.lock, { pid: process.pid, instanceId });
  }
}

async function cmdBackup(ctx, a) {
  const r = await withProfile(
    ctx,
    () => ipcRequest(ctx.lp, 'backup', { reason: 'launcher' }, { timeoutMs: 120_000 }),
    (mod) => mod.withOfflineRecovery(ctx.root, ({ recovery }) => recovery.backupNow('manual', 'launcher-offline')),
  );
  ctx.log.info('backup created', { cmd: 'backup', mode: r.mode, kind: r.value.kind, eventSeq: r.value.eventSeq });
  emit(a.json, uk.backupDone(r.value.relPath, r.value.sha256), { state: 'ok', mode: r.mode, backup: r.value });
  return EXIT_OK;
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function sha256File(path) {
  const h = createHash('sha256');
  for await (const chunk of createReadStream(path)) h.update(chunk);
  return h.digest('hex');
}

async function cmdExport(ctx, a) {
  const out = resolve(a.values.get('--out') ?? join(process.cwd(), `spanish-learning-lab-export-${stamp()}.zip`));
  if (existsSync(out)) throw new CliError('OUTPUT_EXISTS', uk.exportExists(out));
  const selfContained = a.flags.has('--self-contained');
  const deliver = async (art) => {
    copyFileSync(art.path, out, constants.COPYFILE_EXCL);
    chmodSync(out, 0o600);
    if ((await sha256File(out)) !== art.sha256) {
      removeQuiet(out);
      throw new CliError('EXPORT_COPY_MISMATCH', 'copied export does not match its hash');
    }
    return { out, sha256: art.sha256, sizeBytes: art.sizeBytes };
  };
  const r = await withProfile(
    ctx,
    async () => deliver(await ipcRequest(ctx.lp, 'export', { selfContained }, { timeoutMs: 600_000 })),
    (mod) => mod.withOfflineRecovery(ctx.root, async ({ recovery }) => deliver(await recovery.exportProfile({ selfContained }))),
  );
  ctx.log.info('export written', { cmd: 'export', mode: r.mode, selfContained, sizeBytes: r.value.sizeBytes });
  emit(a.json, uk.exportDone(r.value.out, r.value.sizeBytes, r.value.sha256), { state: 'ok', mode: r.mode, selfContained, ...r.value });
  return EXIT_OK;
}

async function cmdRestorePreview(ctx, a) {
  const archive = resolve(a.values.get('--preview'));
  let regular = false;
  try {
    regular = lstatSync(archive).isFile();
  } catch {
    regular = false;
  }
  if (!regular) throw new CliError('ARCHIVE_NOT_FOUND', `archive is not a regular file: ${archive}`);
  const r = await withProfile(
    ctx,
    () => ipcRequest(ctx.lp, 'restore-preview', { archivePath: archive }, { timeoutMs: 600_000 }),
    (mod) =>
      mod.withOfflineRecovery(ctx.root, async ({ recovery }) => {
        const up = await recovery.storeUpload(createReadStream(archive));
        return recovery.previewRestore(up.id);
      }),
  );
  const pv = r.value;
  ctx.log.info('restore previewed', { cmd: 'restore-preview', mode: r.mode, requiresSourceTrust: pv.requiresSourceTrust });
  const trust = pv.requiresSourceTrust ? ' --trust-imported-provenance' : '';
  const human = [
    uk.previewTitle,
    uk.previewLine('Профіль', pv.profileId),
    uk.previewLine('Спроб', pv.attemptCount),
    uk.previewLine('Чернеток', pv.draftCount),
    uk.previewLine('Версія схеми', pv.schemaVersion),
    uk.previewLine('Відсутні аудіофайли', pv.missingAssets.length),
    uk.previewLine('SHA-256 архіву', pv.archiveHash),
    uk.previewLine('Дійсно до', pv.expiresAt),
    ...(pv.requiresSourceTrust ? [uk.previewTrust] : []),
    uk.previewConfirm(`sll restore --confirm ${pv.id} --token ${pv.confirmation}${trust}`),
  ].join('\n');
  emit(a.json, human, { state: 'previewed', mode: r.mode, preview: pv });
  return EXIT_OK;
}

async function cmdRestoreConfirm(ctx, a) {
  const previewId = a.values.get('--confirm');
  const confirmation = a.values.get('--token');
  if (!confirmation) throw new CliError('USAGE', '--token is required with --confirm', EXIT_USAGE);
  if (!PREVIEW_ID.test(previewId)) throw new CliError('RESTORE_PREVIEW_UNKNOWN', uk.previewUnknown);
  const record = readJson(join(ctx.lp.previews, `${previewId}.json`));
  if (!record || typeof record.archiveHash !== 'string') throw new CliError('RESTORE_PREVIEW_UNKNOWN', uk.previewUnknown);
  const input = { operationId: randomUUID(), previewId, archiveHash: record.archiveHash, confirmation, trustImportedProvenance: a.flags.has('--trust-imported-provenance') };
  let recovered = false;
  const r = await withProfile(
    ctx,
    async () => {
      try {
        return await ipcRequest(ctx.lp, 'restore-confirm', input, { timeoutMs: 600_000 });
      } catch (err) {
        if (!(err instanceof IpcError) || !err.transport) throw err;
        // Lost response: never resend the confirmation; read the outcome marker of the live profile instead.
        const deadline = Date.now() + 60_000;
        while (Date.now() < deadline) {
          try {
            const st = await ipcRequest(ctx.lp, 'status', {}, { timeoutMs: 3000 });
            if (st.lastRestoreOperationId === input.operationId) {
              recovered = true;
              return { operationId: input.operationId, newEpoch: st.profileEpoch, archiveHash: record.archiveHash, profileId: st.profileId };
            }
            if (!st.maintenance?.on) break;
          } catch {
            /* service busy or restarting */
          }
          await sleep(500);
        }
        throw new CliError('RESTORE_OUTCOME_UNKNOWN', uk.restoreUnknownOutcome);
      }
    },
    (mod) => mod.withOfflineRecovery(ctx.root, ({ recovery }) => recovery.confirmRestore(input)),
  );
  const outcome = r.value;
  const rt = readRuntime(ctx.lp);
  if (rt) writeRuntime(ctx.lp, { ...rt, profileEpoch: outcome.newEpoch });
  ctx.log.info('restore confirmed', { cmd: 'restore-confirm', mode: r.mode, newEpoch: outcome.newEpoch, recovered });
  emit(a.json, recovered ? uk.restoreRecovered(outcome.newEpoch) : uk.restoreDone(outcome.newEpoch), { state: 'restored', mode: r.mode, recovered, outcome });
  if (r.mode === 'online' && a.flags.has('--open')) {
    const inst = await findInstance(ctx);
    if (inst.state === 'running') await openBrowser(ctx, inst.status.port, { loopback: a.flags.has('--loopback'), json: a.json });
  }
  return EXIT_OK;
}

// ---------------------------------------------------------------------------------------------------------

async function main(argv) {
  let a;
  try {
    a = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`${err.message}\n${uk.usage}\n`);
    return EXIT_USAGE;
  }
  if (!a.cmd || a.cmd === 'help' || a.flags.has('--help')) {
    process.stdout.write(`${uk.usage}\n`);
    return a.cmd ? EXIT_OK : EXIT_USAGE;
  }
  const ctx = context();
  try {
    switch (a.cmd) {
      case 'start':
        return await cmdStart(ctx, a);
      case 'status':
        return await cmdStatus(ctx, a);
      case 'open':
        return await cmdOpen(ctx, a);
      case 'stop':
        return await cmdStop(ctx, a);
      case 'backup':
        return await cmdBackup(ctx, a);
      case 'export':
        return await cmdExport(ctx, a);
      case 'restore':
        if (a.values.has('--preview') && !a.values.has('--confirm')) return await cmdRestorePreview(ctx, a);
        if (a.values.has('--confirm') && !a.values.has('--preview')) return await cmdRestoreConfirm(ctx, a);
        throw new CliError('USAGE', 'restore needs exactly one of --preview <zip> or --confirm <previewId>', EXIT_USAGE);
      default:
        throw new CliError('USAGE', `unknown command ${a.cmd}`, EXIT_USAGE);
    }
  } catch (err) {
    const code = err.code ?? 'UNEXPECTED';
    const message = err.message ?? String(err);
    ctx.log.error('command failed', { cmd: a.cmd, code });
    if (a.json) process.stdout.write(`${JSON.stringify({ state: 'error', code, message })}\n`);
    else process.stderr.write(`${uk.failed(code, message)}\n`);
    if (err.exitCode === EXIT_USAGE) process.stderr.write(`${uk.usage}\n`);
    return err.exitCode ?? EXIT_FAIL;
  }
}

const code = await main(process.argv.slice(2));
process.exitCode = code;
