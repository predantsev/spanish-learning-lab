// Runs the full content validator and reports only the issues that belong to the a1-late range
// (A1-04…A1-06), optionally only up to one lesson in course order (lessons authored so far).
//   node tools/authoring/a1-late/check.ts [--upto A1-05-L3] [--warnings] [--json]
// Exit 1 when an error of the selected scope remains. The unfiltered gate stays
// `npm run content:validate`.
import { DEFAULT_LEDGER_PATH, DEFAULT_REVIEWS_DIR, DEFAULT_SOURCE_DIR, flagString, parseArgs } from '../../content/load.ts';
import type { Issue } from '../../content/load.ts';
import { compareLessons } from '../../content/ledger.ts';
import { formatIssue, runValidation } from '../../content/validate.ts';
import { createReceiptIndex } from '../../review/store.ts';

const BLOCKS = ['A1-04', 'A1-05', 'A1-06'];

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const upto = flagString(flags, 'upto');
  const receipts = createReceiptIndex({ reviewsDir: DEFAULT_REVIEWS_DIR });
  const result = runValidation({ sourceDir: DEFAULT_SOURCE_DIR, ledgerPath: DEFAULT_LEDGER_PATH, receipts });
  const { corpus } = result;
  const lessonOf = new Map<string, string>();
  for (const s of corpus.skills) lessonOf.set(`skill|${s.id}`, s.body.firstLesson);
  for (const x of corpus.lexemes) lessonOf.set(`lexeme|${x.id}`, x.body.firstLesson);
  for (const l of corpus.lessons) lessonOf.set(`lesson|${l.id}`, l.id);
  for (const t of corpus.tasks) lessonOf.set(`task|${t.id}`, t.body.lessonId);
  for (const c of corpus.clips) lessonOf.set(`clip|${c.id}`, c.body.lessonId);
  for (const m of corpus.materials) lessonOf.set(`material|${m.id}`, m.body.topicId.length === 5 ? `${m.body.topicId}-L1` : m.body.topicId);

  const inRange = (lessonId: string | undefined): boolean => {
    if (!lessonId || !BLOCKS.includes(lessonId.slice(0, 5))) return false;
    return upto ? compareLessons(lessonId, upto) <= 0 : true;
  };
  const mine = (issue: Issue): boolean => {
    if (issue.entity) return inRange(lessonOf.get(`${issue.entity.kind}|${issue.entity.id}`));
    const file = issue.file ?? '';
    const fileLesson = /^(?:lessons|tasks)\/(A1-0[4-6]-(?:L\d{1,2}|C1))\.json$/.exec(file)?.[1];
    if (fileLesson) return inRange(fileLesson);
    if (/^(?:audio|materials|skills|lexicon)\/A1-0[4-6]\.json$/.test(file)) return true;
    const ids = issue.message.match(/A1-0[4-6]-(?:L\d{1,2}|C1)/g) ?? [];
    if (ids.length > 0) return ids.some((id) => inRange(id));
    return false;
  };
  const errors = result.errors.filter(mine);
  const warnings = result.warnings.filter(mine);
  if (flags.has('json')) {
    console.log(JSON.stringify({ errors, warnings }, null, 2));
  } else {
    const byCode = (list: Issue[]): string =>
      Object.entries(list.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.code]: (acc[i.code] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])
        .map(([code, n]) => `${code}×${n}`)
        .join(', ');
    console.log(`a1-late check${upto ? ` (up to ${upto})` : ''}: ${errors.length} error(s), ${warnings.length} warning(s) [corpus total ${result.errors.length} errors]`);
    if (warnings.length > 0) {
      console.log(`WARNINGS: ${byCode(warnings)}`);
      if (flags.has('warnings')) for (const w of warnings) console.log(`  ${formatIssue(w)}`);
    }
    if (errors.length > 0) {
      console.log(`ERRORS: ${byCode(errors)}`);
      for (const e of errors) console.log(`  ${formatIssue(e)}`);
    }
  }
  if (errors.length > 0) process.exit(1);
}

main();
