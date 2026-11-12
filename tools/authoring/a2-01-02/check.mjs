// Runs the content validator and prints only the issues that belong to range a2-01-02:
// entities of authored A2-01/A2-02 lessons (lesson, its tasks, its first-taught skills, block clips,
// materials, lexicon) — completeness gaps of lessons not yet authored are counted, not listed.
// Usage: node tools/authoring/a2-01-02/check.mjs [--warnings]
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runValidation, formatIssue } from '../../content/validate.ts';
import { createReceiptIndex } from '../../review/store.ts';

const ROOT = new URL('../../../', import.meta.url).pathname;
const SRC = join(ROOT, 'content', 'source');
const authored = new Set(readdirSync(join(SRC, 'lessons')).filter((f) => /^A2-0[12]-/.test(f)).map((f) => f.replace('.json', '')));
const result = runValidation({
  sourceDir: SRC,
  ledgerPath: join(ROOT, 'docs', 'contracts', 'curriculum-ledger.json'),
  receipts: createReceiptIndex({ reviewsDir: join(ROOT, 'content', 'reviews'), verifySignatures: false }),
});
const skillLesson = new Map(result.corpus.skills.map((s) => [s.id, s.body.firstLesson]));
const mine = (issue) => {
  const id = issue.entity?.id ?? '';
  const file = issue.file ?? '';
  if (/^(lessons|tasks)\/A2-0[12]-/.test(file) || /^(audio|materials|lexicon|skills)\/A2-0[12]\.json$/.test(file)) {
    if (issue.entity?.kind === 'skill' && ['target.untested', 'listening.clips'].includes(issue.code)) return authored.has(skillLesson.get(id));
    return true;
  }
  if (/^A2-0[12]-/.test(id)) return authored.has(id.replace(/-T\d+$/, ''));
  if (issue.code === 'ledger.lesson-missing') return false;
  return /A2-0[12]-(L\d|C1)/.test(issue.message) && [...authored].some((l) => issue.message.includes(l));
};
const errors = result.errors.filter(mine);
const warnings = result.warnings.filter(mine);
const pending = result.errors.filter((i) => !mine(i) && (/^(lessons|tasks|skills|audio|materials|lexicon)\/A2-0[12]/.test(i.file ?? '') || /A2-0[12]-(L\d|C1)/.test(i.message)));
console.log(`authored: ${[...authored].sort().join(', ')}`);
console.log(`range errors: ${errors.length}; range warnings: ${warnings.length}; pending completeness errors of unauthored A2-01/A2-02 lessons: ${pending.length}`);
for (const e of errors) console.log(`ERROR ${formatIssue(e)}`);
if (process.argv.includes('--warnings')) for (const w of warnings) console.log(`warn  ${formatIssue(w)}`);
else {
  const byCode = warnings.reduce((acc, w) => ({ ...acc, [w.code]: (acc[w.code] ?? 0) + 1 }), {});
  console.log(`warnings by code: ${JSON.stringify(byCode)}`);
}
console.log(`whole corpus: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
if (errors.length) process.exitCode = 1;
