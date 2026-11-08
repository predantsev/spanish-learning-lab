// Runs the content validator and prints only the issues of the A1-01 … A1-03 range (files, entities
// or messages naming one of its lessons/blocks), plus the bank statistics of the range's skills.
//   node tools/authoring/a1-early/check.ts [--all-warnings]
import { DEFAULT_LEDGER_PATH, DEFAULT_REVIEWS_DIR, DEFAULT_SOURCE_DIR } from '../../content/load.ts';
import { bankStats, formatIssue, runValidation } from '../../content/validate.ts';
import { createReceiptIndex } from '../../review/store.ts';

const RANGE = /A1-0[123]/;
const result = runValidation({
  sourceDir: DEFAULT_SOURCE_DIR,
  ledgerPath: DEFAULT_LEDGER_PATH,
  receipts: createReceiptIndex({ reviewsDir: DEFAULT_REVIEWS_DIR, verifySignatures: false }),
});
const mine = (i: { file?: string; message: string; entity?: { id: string } }): boolean =>
  RANGE.test(i.file ?? '') || RANGE.test(i.entity?.id ?? '') || RANGE.test(i.message);
const errors = result.errors.filter(mine);
const warnings = result.warnings.filter(mine);
const skillFile = new Map(result.corpus.skills.map((s) => [s.id, s.file]));
const byCode = (list: typeof errors): string =>
  Object.entries(list.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.code]: (acc[i.code] ?? 0) + 1 }), {}))
    .map(([c, n]) => `${c}×${n}`)
    .join(', ');
console.log(`range errors ${errors.length}: ${byCode(errors)}`);
for (const e of errors) console.log(`  E ${formatIssue(e)}`);
console.log(`range warnings ${warnings.length}: ${byCode(warnings)}`);
for (const w of warnings) console.log(`  W ${formatIssue(w)}`);
console.log('bank (productive skills of the range): skill total sup/ind/held families modes justified');
for (const s of bankStats(result.corpus)) {
  if (!RANGE.test(skillFile.get(s.skillId) ?? '')) continue;
  if (s.total === 0) continue;
  console.log(`  ${s.skillId} ${s.total} ${s.supported}/${s.independent}/${s.heldOut} f${s.families} m${s.modes}${s.justified ? ' J' : ''}`);
}
