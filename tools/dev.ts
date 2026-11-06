// npm run dev [-- --synthetic] [-- --fresh]
// Brings up a working local app for development on a private DEV home (default <repo>/.tmp/dev-home, or
// SLL_HOME when set): builds dist/web if missing, stops this home's own service if it runs, builds a preview
// pack from content/source (`tools/content/pack.ts --allow-unreviewed`) — or the synthetic test pack with
// --synthetic — installs it (`--allow-preview`), starts the service through the launcher on 127.0.0.1 (prior
// port or 0) and prints the one-use open link. The service keeps running; stop it with the printed command.
import { existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildSyntheticPack } from '../tests/fixtures/pack-synthetic/build-pack.ts';
import { buildPreviewPack, ensureWebBuild, installPackDir, openLink, REPO, startService, stopService } from './dev-lib.ts';

const args = new Set(process.argv.slice(2));
const log = (s: string): void => {
  process.stdout.write(`${s}\n`);
};

const home = resolve(process.env.SLL_HOME && process.env.SLL_HOME.trim() !== '' ? process.env.SLL_HOME : join(REPO, '.tmp', 'dev-home'));
if (args.has('--fresh')) {
  if (!home.startsWith(join(REPO, '.tmp'))) throw new Error('--fresh only removes a home under <repo>/.tmp');
  stopService(home);
  rmSync(home, { recursive: true, force: true });
}
log(`dev home: ${home}`);
ensureWebBuild(log);
stopService(home); // a pack is installed while the service is stopped (the CLI refuses otherwise)

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const packDir = join(REPO, '.tmp', 'dev-packs', `${args.has('--synthetic') ? 'synthetic' : 'preview'}-${stamp}`);
if (args.has('--synthetic')) {
  buildSyntheticPack(packDir, { version: `0.0.0-synthetic.${stamp}` });
  log(`synthetic pack built: ${packDir}`);
} else {
  buildPreviewPack(packDir, `0.0.0-dev.${stamp}`);
  log(`preview pack built from content/source: ${packDir}`);
}
const installed = installPackDir(home, packDir, true);
log(`pack installed: ${installed.packId}@${installed.version} (${installed.outcome}, ${installed.entities} entities, ${installed.warnings?.length ?? 0} reference warnings${installed.preBackup ? ', pre-change backup taken' : ''})`);
if (!existsSync(join(packDir, 'pack.json'))) throw new Error('pack.json missing after build');

const svc = startService(home);
log(`service running: ${svc.url} (pid ${svc.pid})`);
log(`open (one use, 60 s): ${openLink(home)}`);
log(`loopback fallback: http://127.0.0.1:${svc.port} (get a new link: SLL_HOME='${home}' node bin/sll.mjs open --loopback)`);
log(`stop: SLL_HOME='${home}' node bin/sll.mjs stop`);
