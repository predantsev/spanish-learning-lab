// Runs `content:validate --json` and prints only the issues of this range (blocks A2-03, A2-04):
// issues located in their lessons/tasks/audio/materials/skills/lexicon files, or whose entity id or
// message names one of their lessons. Usage: node tools/authoring/a2-03-04/check.mjs [--all-warnings]
import { spawnSync } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// validate.ts exits right after printing; a pipe would truncate the JSON, so write it to a file.
const dir = mkdtempSync(join(tmpdir(), 'sll-check-'));
const out = join(dir, 'validate.json');
const fd = openSync(out, 'w');
spawnSync(process.execPath, [join(ROOT, 'tools/content/validate.ts'), '--json'], { cwd: ROOT, stdio: ['ignore', fd, 'inherit'] });
closeSync(fd);
const raw = readFileSync(out, 'utf8');
rmSync(dir, { recursive: true, force: true });
const json = JSON.parse(raw.slice(raw.indexOf('{')));
const MINE = /A2-0[34]/;
const mine = (i) => MINE.test(i.file ?? '') || MINE.test(i.entity?.id ?? '') || (!i.file && MINE.test(i.message));
const errors = json.errors.filter(mine);
const warnings = json.warnings.filter(mine);
const fmt = (i) => `[${i.code}] ${i.file ?? ''} ${i.entity ? `${i.entity.kind} ${i.entity.id}` : ''}: ${i.message}`;
const counts = (list) => Object.entries(list.reduce((a, i) => ({ ...a, [i.code]: (a[i.code] ?? 0) + 1 }), {})).map(([c, n]) => `${c}×${n}`).join(', ');
console.log(`range a2-03-04: ${errors.length} error(s), ${warnings.length} warning(s) (corpus total ${json.errors.length} errors)`);
if (warnings.length) console.log(`warnings: ${counts(warnings)}`);
for (const w of warnings) if (process.argv.includes('--all-warnings') || !/^(lesson\.held-out-in-step|lesson\.foreign-task)$/.test(w.code)) console.log(`  W ${fmt(w)}`);
if (errors.length) console.log(`errors: ${counts(errors)}`);
for (const e of errors) console.log(`  E ${fmt(e)}`);
process.exit(errors.length > 0 ? 1 : 0);
