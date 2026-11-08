// Per-lesson task counts by role and per-skill bank statistics for the a1-late range.
//   node tools/authoring/a1-late/stats.ts [--markdown]
import { loadCorpus, parseArgs } from '../../content/load.ts';
import { compareLessons } from '../../content/ledger.ts';
import { bankStats, tasksBySkill } from '../../content/validate.ts';

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const md = flags.has('markdown');
  const { corpus } = loadCorpus();
  const lessons = corpus.lessons.filter((l) => /^A1-0[4-6]/.test(l.id)).sort((a, b) => compareLessons(a.id, b.id));
  const roles = ['supported', 'independent', 'delayed', 'transfer'] as const;
  console.log(md ? '| Lesson | Tasks | supported | independent | delayed | transfer | clips | status |\n|---|---|---|---|---|---|---|---|' : 'lesson tasks sup ind del tr clips');
  for (const l of lessons) {
    const tasks = corpus.tasks.filter((t) => t.body.lessonId === l.id);
    const counts = roles.map((r) => tasks.filter((t) => t.body.role === r).length);
    const clips = corpus.clips.filter((c) => c.body.lessonId === l.id).length;
    const states = [...new Set(tasks.map((t) => t.body.reviewStatus))].join('/');
    console.log(md ? `| ${l.id} | ${tasks.length} | ${counts.join(' | ')} | ${clips} | ${states} |` : `${l.id} ${tasks.length} ${counts.join(' ')} ${clips} ${states}`);
  }
  const mine = new Set(corpus.skills.filter((s) => /^A1-0[4-6]/.test(s.body.firstLesson)).map((s) => s.id));
  console.log(md ? '\n| Skill | bank | sup | ind | held-out | families | modes | justified |\n|---|---|---|---|---|---|---|---|' : '\nskill total sup ind held fam modes justified');
  for (const s of bankStats(corpus).filter((x) => mine.has(x.skillId))) {
    const row = [s.skillId, s.total, s.supported, s.independent, s.heldOut, s.families, s.modes, s.justified ? 'yes' : '-'];
    console.log(md ? `| ${row.join(' | ')} |` : row.join(' '));
  }
  const index = tasksBySkill(corpus);
  const other = corpus.skills.filter((s) => mine.has(s.id) && !bankStats(corpus).some((b) => b.skillId === s.id));
  console.log(md ? '\n| Non-bank skill | tasks | modalities tested |\n|---|---|---|' : '\nnon-bank skill tasks modalities');
  for (const s of other) {
    const tasks = index.get(s.id) ?? [];
    const mods = [...new Set(tasks.flatMap((t) => t.body.targets.filter((x) => x.skillId === s.id).map((x) => x.modality)))].join(',');
    console.log(md ? `| ${s.id} | ${tasks.length} | ${mods} |` : `${s.id} ${tasks.length} ${mods}`);
  }
}

main();
