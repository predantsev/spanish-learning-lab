// Playwright global setup: a throwaway SLL_HOME with the SYNTHETIC test pack (ACCEPTANCE §Automated fixtures —
// e2e never uses a real profile or unreviewed course text as fixtures), the real service started through the
// launcher on 127.0.0.1 port 0, and the environment the UI specs read (tests/e2e/ui-helpers.ts):
// SLL_E2E_URL, SLL_E2E_NONCE_CMD and the fixture task revision ids. Teardown stops that service only.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSyntheticPack } from '../fixtures/pack-synthetic/build-pack.ts';
import { ensureWebBuild, installPackDir, startService, stopService } from '../../tools/dev-lib.ts';

function revisionIds(packDir: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of readFileSync(join(packDir, 'entities.ndjson'), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const e = JSON.parse(line) as { kind: string; logicalId: string; revisionId: string };
    if (e.kind === 'task') map.set(e.logicalId, e.revisionId);
  }
  return map;
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  const base = mkdtempSync(join(tmpdir(), 'sll-e2e-'));
  const home = join(base, 'home');
  ensureWebBuild((s) => process.stdout.write(`[e2e] ${s}\n`));
  const pack = buildSyntheticPack(join(base, 'pack'));
  installPackDir(home, pack.dir, false);
  const svc = startService(home);
  const tasks = revisionIds(pack.dir);
  const nonceCmd = `SLL_HOME='${home}' '${process.execPath}' '${fileURLToPath(new URL('./print-nonce.mjs', import.meta.url))}'`;
  Object.assign(process.env, {
    SLL_E2E_URL: svc.url,
    SLL_E2E_NONCE_CMD: nonceCmd,
    SLL_E2E_SHORT_TASK: tasks.get('A2-03-L2-T02'),
    SLL_E2E_MULTILINE_TASK: tasks.get('A2-03-L2-T04'),
    SLL_E2E_RUBRIC_TASK: tasks.get('A2-03-L2-T04'),
    SLL_E2E_LISTENING_TASK: tasks.get('A1-05-L1-T01'),
    SLL_E2E_TOPIC: 'A2-03',
    SLL_E2E_HOME: home,
  });
  process.stdout.write(`[e2e] service ${svc.url} (pid ${svc.pid}) home ${home}\n`);
  return async () => {
    stopService(home);
    rmSync(base, { recursive: true, force: true });
  };
}
