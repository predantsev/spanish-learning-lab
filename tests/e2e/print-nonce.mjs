// SLL_E2E_NONCE_CMD helper: asks the launcher (bin/sll.mjs open --print-url) of SLL_HOME's running service
// for a fresh one-use nonce and prints only the nonce (43 base64url chars). No browser is launched.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sll = fileURLToPath(new URL('../../bin/sll.mjs', import.meta.url));
const out = execFileSync(process.execPath, [sll, 'open', '--print-url', '--json'], { env: { ...process.env, SLL_SERVER_ENTRY: '' }, encoding: 'utf8' });
const url = JSON.parse(out.trim().split('\n').at(-1)).url;
process.stdout.write(`${url.split('#n=')[1]}\n`);
