// Coverage report: counts concrete artifacts in content/source per block, objective, lesson,
// optional check, CV allocation, skill and modality, with production states, missing items,
// bank deviations and a deterministic digest. It counts real files only — a broad ledger
// objective is never counted as covered by itself.
// CLI: node tools/content/coverage.ts [--source dir] [--ledger file] [--out file]
//      default --out content/reports/coverage.json; prints a short human summary.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { canonicalSha256 } from './canonical.ts';
import {
  DEFAULT_LEDGER_PATH,
  DEFAULT_SOURCE_DIR,
  REPO_ROOT,
  TOOL_VERSION,
  allEntities,
  entityState,
  flagString,
  isMain,
  loadCorpus,
  parseArgs,
  sourceDigest,
} from './load.ts';
import type { Corpus } from './load.ts';
import { blockOfLesson, compareLessons, loadLedger } from './ledger.ts';
import type { Ledger } from './ledger.ts';
import { bankStats } from './validate.ts';
import type { BankStats } from './validate.ts';
import { MODALITIES, REVIEW_STATUSES } from './types.ts';
import type { EntityKind, ReviewStatus, Task, TaskRole } from './types.ts';
import { normalizeResponse } from './checker.ts';

export const DEFAULT_COVERAGE_PATH = join(REPO_ROOT, 'content', 'reports', 'coverage.json');

type StateCounts = Record<ReviewStatus, number>;
type RoleCounts = Record<TaskRole | 'total' | 'ready', number>;

export interface MissingItem {
  kind: 'lesson' | 'optional-check' | 'objective' | 'cv' | 'target' | 'listening' | 'collections' | 'collection-phrase';
  id: string;
  reason: string;
}

export interface CoverageReport {
  schemaVersion: 1;
  tool: string;
  ledger: { sourceSha256: string | null; objectives: number; lessons: number; checks: number; cv: number };
  sourceDigest: string;
  progress: {
    lessonsAndChecks: { expected: number; present: number; ready: number };
    objectives: { expected: number; withSkills: number; withAssessedSkills: number; withReadyTasks: number };
    cv: { expected: number; onLessons: number; onSkills: number };
    skills: { total: number; assessed: number; ready: number };
    targets: { authored: number; withTasks: number; withReadyTasks: number };
    tasks: RoleCounts;
    listeningTargets: { authored: number; withTwoClips: number; withTwoReadyClips: number };
    clips: { total: number; ready: number };
    collections: { expected: number; present: number; ready: number };
    collectionMemberships: { expected: number; present: number; ready: number };
    productiveBanks: { skills: number; withinRange: number; justified: number };
    /** Percentages over FIXED ledger denominators only (never over authored totals). */
    percent: { lessonsAndChecksReady: number; objectivesWithReadyTasks: number; cvAllocated: number; collectionMembershipsReady: number };
  };
  states: Record<EntityKind, StateCounts>;
  byBlock: Record<string, {
    objectives: { expected: number; withSkills: number };
    lessons: { expected: number; present: number; ready: number };
    skills: number;
    assessedSkills: number;
    tasks: RoleCounts;
    clips: number;
    lexemes: number;
    phrases: number;
    materials: number;
  }>;
  byObjective: Record<string, { blockId: string; skills: number; assessedSkills: number; tasks: number; readyTasks: number; lessons: string[] }>;
  byLesson: Record<string, LessonCoverage>;
  byCheck: Record<string, LessonCoverage>;
  byCv: Record<string, { lessons: string[]; skills: string[] }>;
  bySkill: Record<string, {
    kind: string;
    assessed: boolean;
    state: ReviewStatus;
    firstLesson: string;
    modalities: Record<string, { tasks: RoleCounts; clips: number }>;
    families: number;
    modes: number;
  }>;
  byModality: Record<string, { skills: number; tasks: RoleCounts; clips: number }>;
  missing: MissingItem[];
  bankDeviations: BankStats[];
  coverageDigest: string;
}

interface LessonCoverage {
  present: boolean;
  state: ReviewStatus | null;
  introduces: number;
  revisits: number;
  steps: number;
  estimatedMinutes: number | null;
  tasks: RoleCounts;
  clips: number;
  lexemes: number;
  phrases: number;
  materials: number;
}

const emptyStates = (): StateCounts => ({ draft: 0, 'needs-review': 0, reviewed: 0, ready: 0, quarantined: 0 });
const emptyRoles = (): RoleCounts => ({ supported: 0, independent: 0, delayed: 0, transfer: 0, total: 0, ready: 0 });

function addTask(counts: RoleCounts, task: Task): void {
  counts[task.role] += 1;
  counts.total += 1;
  if (task.reviewStatus === 'ready') counts.ready += 1;
}

const pct = (n: number, d: number): number => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);

export function computeCoverage(corpus: Corpus, ledger: Ledger): CoverageReport {
  const states = {} as Record<EntityKind, StateCounts>;
  for (const kind of ['source', 'situation', 'skill', 'lexeme', 'lesson', 'task', 'clip', 'phrase', 'collection', 'material'] as EntityKind[]) states[kind] = emptyStates();
  for (const record of allEntities(corpus)) states[record.kind][entityState(record)] += 1;

  const skills = new Map(corpus.skills.map((s) => [s.id, s.body]));
  const lessonFiles = new Map(corpus.lessons.map((l) => [l.id, l.body]));
  const tasks = corpus.tasks.map((t) => t.body).filter((t) => t.reviewStatus !== 'quarantined');
  const missing: MissingItem[] = [];

  // Lessons and checks.
  const lessonCoverage = (id: string): LessonCoverage => {
    const l = lessonFiles.get(id);
    const own = emptyRoles();
    for (const t of tasks) if (t.lessonId === id) addTask(own, t);
    return {
      present: l !== undefined,
      state: l?.reviewStatus ?? null,
      introduces: l?.introduces.length ?? 0,
      revisits: l?.revisits.length ?? 0,
      steps: l?.steps.length ?? 0,
      estimatedMinutes: l?.estimatedMinutes ?? null,
      tasks: own,
      clips: corpus.clips.filter((c) => c.body.lessonId === id).length,
      lexemes: corpus.lexemes.filter((x) => x.body.firstLesson === id).length,
      phrases: corpus.phrases.filter((p) => p.body.firstLesson === id).length,
      materials: corpus.materials.filter((m) => m.body.topicId === id).length,
    };
  };
  const byLesson: Record<string, LessonCoverage> = {};
  const byCheck: Record<string, LessonCoverage> = {};
  for (const id of [...ledger.lessons].sort(compareLessons)) {
    byLesson[id] = lessonCoverage(id);
    if (!lessonFiles.has(id)) missing.push({ kind: 'lesson', id, reason: 'no lesson file' });
  }
  for (const id of [...ledger.checks].sort(compareLessons)) {
    byCheck[id] = lessonCoverage(id);
    if (!lessonFiles.has(id)) missing.push({ kind: 'optional-check', id, reason: 'no lesson file' });
  }

  // Skills and targets.
  const bySkill: CoverageReport['bySkill'] = {};
  const byModality: CoverageReport['byModality'] = {};
  for (const m of MODALITIES) byModality[m] = { skills: 0, tasks: emptyRoles(), clips: 0 };
  let authoredTargets = 0;
  let targetsWithTasks = 0;
  let targetsWithReadyTasks = 0;
  const readyTaskTargets = new Set<string>();
  for (const t of tasks) if (t.reviewStatus === 'ready') for (const x of t.targets) readyTaskTargets.add(`${x.skillId}/${x.modality}`);
  const phraseRecall = new Set(corpus.phrases.filter((p) => p.body.recall).flatMap((p) => p.body.skills.map((s) => `${s}/phrase-recall`)));
  const readyPhraseRecall = new Set(corpus.phrases.filter((p) => p.body.recall && p.body.reviewStatus === 'ready').flatMap((p) => p.body.skills.map((s) => `${s}/phrase-recall`)));
  for (const record of corpus.skills) {
    const s = record.body;
    const modalities: Record<string, { tasks: RoleCounts; clips: number }> = {};
    const own = tasks.filter((t) => t.targets.some((x) => x.skillId === s.skillId));
    for (const m of s.modalities) {
      const counts = emptyRoles();
      for (const t of own) if (t.targets.some((x) => x.skillId === s.skillId && x.modality === m)) addTask(counts, t);
      const clips = corpus.clips.filter((c) => c.body.targets.some((x) => x.skillId === s.skillId && x.modality === m)).length;
      modalities[m] = { tasks: counts, clips };
      const bucket = byModality[m];
      if (bucket) {
        bucket.skills += 1;
        bucket.clips += clips;
        for (const role of ['supported', 'independent', 'delayed', 'transfer', 'total', 'ready'] as const) bucket.tasks[role] += counts[role];
      }
      if (s.assessed) {
        const key = `${s.skillId}/${m}`;
        authoredTargets += 1;
        if (counts.total > 0 || phraseRecall.has(key)) targetsWithTasks += 1;
        else missing.push({ kind: 'target', id: key, reason: 'assessed target has no task' });
        if (readyTaskTargets.has(key) || readyPhraseRecall.has(key)) targetsWithReadyTasks += 1;
      }
    }
    bySkill[s.skillId] = {
      kind: s.kind,
      assessed: s.assessed,
      state: s.reviewStatus,
      firstLesson: s.firstLesson,
      modalities,
      families: new Set(own.map((t) => t.family)).size,
      modes: new Set(own.map((t) => t.mode)).size,
    };
  }

  // Objectives.
  const byObjective: CoverageReport['byObjective'] = {};
  let objectivesWithSkills = 0;
  let objectivesWithAssessed = 0;
  let objectivesWithReadyTasks = 0;
  for (const row of ledger.rows.filter((r) => r.kind === 'objective')) {
    const own = corpus.skills.filter((s) => s.body.parentObjectives.includes(row.id)).map((s) => s.body);
    const ids = new Set(own.map((s) => s.skillId));
    const objectiveTasks = tasks.filter((t) => t.targets.some((x) => ids.has(x.skillId)));
    const readyTasks = objectiveTasks.filter((t) => t.reviewStatus === 'ready').length;
    byObjective[row.id] = {
      blockId: row.blockId,
      skills: own.length,
      assessedSkills: own.filter((s) => s.assessed).length,
      tasks: objectiveTasks.length,
      readyTasks,
      lessons: corpus.lessons.filter((l) => l.body.objectives.includes(row.id)).map((l) => l.id).sort(compareLessons),
    };
    if (own.length > 0) objectivesWithSkills += 1;
    else missing.push({ kind: 'objective', id: row.id, reason: 'no skill lists it as parent objective' });
    if (own.some((s) => s.assessed)) objectivesWithAssessed += 1;
    if (readyTasks > 0) objectivesWithReadyTasks += 1;
  }

  // CV allocations.
  const byCv: CoverageReport['byCv'] = {};
  let cvOnLessons = 0;
  let cvOnSkills = 0;
  for (const cv of ledger.cv) {
    const lessons = corpus.lessons.filter((l) => (l.body.cv ?? []).includes(cv)).map((l) => l.id).sort(compareLessons);
    const skillIds = corpus.skills.filter((s) => (s.body.cv ?? []).includes(cv)).map((s) => s.id).sort();
    byCv[cv] = { lessons, skills: skillIds };
    if (lessons.length > 0) cvOnLessons += 1;
    else missing.push({ kind: 'cv', id: cv, reason: 'not allocated to any lesson' });
    if (skillIds.length > 0) cvOnSkills += 1;
    else missing.push({ kind: 'cv', id: cv, reason: 'not allocated to any skill' });
  }

  // Listening.
  let listeningAuthored = 0;
  let listeningTwo = 0;
  let listeningTwoReady = 0;
  for (const s of corpus.skills.map((r) => r.body)) {
    if (!s.assessed || !s.modalities.includes('listening-meaning')) continue;
    listeningAuthored += 1;
    const clips = corpus.clips.map((c) => c.body).filter((c) => c.reviewStatus !== 'quarantined' && c.targets.some((x) => x.skillId === s.skillId && x.modality === 'listening-meaning'));
    const distinct = (list: typeof clips): number => new Set(list.map((c) => normalizeResponse(c.transcript, { case: 'insensitive', terminalPunctuation: 'required' }))).size;
    if (distinct(clips) >= 2) listeningTwo += 1;
    else missing.push({ kind: 'listening', id: `${s.skillId}/listening-meaning`, reason: `${distinct(clips)} distinct clip(s); 2 required` });
    if (distinct(clips.filter((c) => c.reviewStatus === 'ready')) >= 2) listeningTwoReady += 1;
  }

  // Collections.
  const phraseState = new Map(corpus.phrases.map((p) => [p.id, p.body.reviewStatus]));
  const memberships = corpus.collections.flatMap((c) => c.body.phraseIds);
  if (corpus.collections.length !== 8) missing.push({ kind: 'collections', id: 'collections.json', reason: `${corpus.collections.length} of 8 prepared collections` });
  for (const c of corpus.collections) for (const id of c.body.phraseIds) if (!phraseState.has(id)) missing.push({ kind: 'collection-phrase', id: `${c.id}:${id}`, reason: 'phrase does not exist' });

  // Blocks.
  const byBlock: CoverageReport['byBlock'] = {};
  for (const blockId of ledger.blocks) {
    const inBlock = (lessonId: string): boolean => blockOfLesson(lessonId) === blockId;
    const objectiveIds = ledger.rows.filter((r) => r.kind === 'objective' && r.blockId === blockId).map((r) => r.id);
    const lessonIds = ledger.rows.filter((r) => r.kind !== 'objective' && r.blockId === blockId).map((r) => r.id);
    const blockTasks = emptyRoles();
    for (const t of tasks) if (inBlock(t.lessonId)) addTask(blockTasks, t);
    const blockSkills = corpus.skills.filter((s) => inBlock(s.body.firstLesson));
    byBlock[blockId] = {
      objectives: { expected: objectiveIds.length, withSkills: objectiveIds.filter((id) => (byObjective[id]?.skills ?? 0) > 0).length },
      lessons: {
        expected: lessonIds.length,
        present: lessonIds.filter((id) => lessonFiles.has(id)).length,
        ready: lessonIds.filter((id) => lessonFiles.get(id)?.reviewStatus === 'ready').length,
      },
      skills: blockSkills.length,
      assessedSkills: blockSkills.filter((s) => s.body.assessed).length,
      tasks: blockTasks,
      clips: corpus.clips.filter((c) => inBlock(c.body.lessonId)).length,
      lexemes: corpus.lexemes.filter((x) => inBlock(x.body.firstLesson)).length,
      phrases: corpus.phrases.filter((p) => inBlock(p.body.firstLesson)).length,
      materials: corpus.materials.filter((m) => m.body.topicId.startsWith(blockId)).length,
    };
  }

  const allTasks = emptyRoles();
  for (const t of tasks) addTask(allTasks, t);
  const banks = bankStats(corpus);
  const bankDeviations = banks.filter((b) => !b.justified && (b.total < 8 || b.total > 12 || b.supported < 2 || b.independent < 4 || b.heldOut < 4 || b.families < 2));
  const expectedLessons = ledger.lessons.length + ledger.checks.length;
  const readyLessons = [...ledger.lessons, ...ledger.checks].filter((id) => lessonFiles.get(id)?.reviewStatus === 'ready').length;
  const readyMemberships = memberships.filter((id) => phraseState.get(id) === 'ready').length;

  const report: Omit<CoverageReport, 'coverageDigest'> = {
    schemaVersion: 1,
    tool: TOOL_VERSION,
    ledger: { sourceSha256: ledger.sourceSha256 ?? null, objectives: ledger.objectives.length, lessons: ledger.lessons.length, checks: ledger.checks.length, cv: ledger.cv.length },
    sourceDigest: sourceDigest(corpus),
    progress: {
      lessonsAndChecks: { expected: expectedLessons, present: [...ledger.lessons, ...ledger.checks].filter((id) => lessonFiles.has(id)).length, ready: readyLessons },
      objectives: { expected: ledger.objectives.length, withSkills: objectivesWithSkills, withAssessedSkills: objectivesWithAssessed, withReadyTasks: objectivesWithReadyTasks },
      cv: { expected: ledger.cv.length, onLessons: cvOnLessons, onSkills: cvOnSkills },
      skills: { total: corpus.skills.length, assessed: corpus.skills.filter((s) => s.body.assessed).length, ready: corpus.skills.filter((s) => s.body.reviewStatus === 'ready').length },
      targets: { authored: authoredTargets, withTasks: targetsWithTasks, withReadyTasks: targetsWithReadyTasks },
      tasks: allTasks,
      listeningTargets: { authored: listeningAuthored, withTwoClips: listeningTwo, withTwoReadyClips: listeningTwoReady },
      clips: { total: corpus.clips.length, ready: corpus.clips.filter((c) => c.body.reviewStatus === 'ready').length },
      collections: { expected: 8, present: corpus.collections.length, ready: corpus.collections.filter((c) => c.body.reviewStatus === 'ready').length },
      collectionMemberships: { expected: 96, present: memberships.length, ready: readyMemberships },
      productiveBanks: { skills: banks.length, withinRange: banks.filter((b) => b.total >= 8 && b.total <= 12).length, justified: banks.filter((b) => b.justified).length },
      percent: {
        lessonsAndChecksReady: pct(readyLessons, expectedLessons),
        objectivesWithReadyTasks: pct(objectivesWithReadyTasks, ledger.objectives.length),
        cvAllocated: pct(ledger.cv.filter((cv) => (byCv[cv]?.lessons.length ?? 0) > 0 && (byCv[cv]?.skills.length ?? 0) > 0).length, ledger.cv.length),
        collectionMembershipsReady: pct(readyMemberships, 96),
      },
    },
    states,
    byBlock,
    byObjective,
    byLesson,
    byCheck,
    byCv,
    bySkill,
    byModality,
    missing: missing.sort((a, b) => (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : compareLessons(a.id, b.id))),
    bankDeviations: bankDeviations.sort((a, b) => (a.skillId < b.skillId ? -1 : 1)),
  };
  return { ...report, coverageDigest: canonicalSha256(report) };
}

/** Recomputes the digest of a stored report (everything except coverageDigest). */
export function coverageDigestOf(report: CoverageReport): string {
  const { coverageDigest: _ignored, ...rest } = report;
  return canonicalSha256(rest);
}

export function summarize(report: CoverageReport): string {
  const p = report.progress;
  const states = (['lesson', 'skill', 'task', 'clip', 'phrase', 'lexeme'] as EntityKind[])
    .map((k) => `${k} ${REVIEW_STATUSES.filter((s) => report.states[k][s] > 0).map((s) => `${s}:${report.states[k][s]}`).join(' ') || '0'}`)
    .join(' | ');
  return [
    `coverage — sourceDigest ${report.sourceDigest.slice(0, 12)}… coverageDigest ${report.coverageDigest.slice(0, 12)}…`,
    `lessons+checks: ${p.lessonsAndChecks.present}/${p.lessonsAndChecks.expected} present, ${p.lessonsAndChecks.ready} ready (${p.percent.lessonsAndChecksReady}%)`,
    `objectives: ${p.objectives.withSkills}/${p.objectives.expected} with skills, ${p.objectives.withReadyTasks} with ready tasks (${p.percent.objectivesWithReadyTasks}%)`,
    `CV: ${p.cv.onLessons}/${p.cv.expected} on lessons, ${p.cv.onSkills}/${p.cv.expected} on skills`,
    `skills: ${p.skills.total} (${p.skills.assessed} assessed, ${p.skills.ready} ready); targets with tasks ${p.targets.withTasks}/${p.targets.authored} authored, with ready tasks ${p.targets.withReadyTasks}`,
    `tasks: ${p.tasks.total} (${p.tasks.ready} ready) — supported ${p.tasks.supported}, independent ${p.tasks.independent}, delayed ${p.tasks.delayed}, transfer ${p.tasks.transfer}`,
    `listening targets with ≥2 clips: ${p.listeningTargets.withTwoClips}/${p.listeningTargets.authored} (ready ${p.listeningTargets.withTwoReadyClips}); clips ${p.clips.total} (${p.clips.ready} ready)`,
    `collections: ${p.collections.present}/8, memberships ${p.collectionMemberships.present}/96 (${p.collectionMemberships.ready} ready phrases)`,
    `productive banks: ${p.productiveBanks.withinRange}/${p.productiveBanks.skills} within 8–12, ${report.bankDeviations.length} deviation(s)`,
    `states: ${states}`,
    `missing: ${report.missing.length} item(s)`,
  ].join('\n');
}

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const { corpus, issues } = loadCorpus({ sourceDir: flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR });
  const ledger = loadLedger(flagString(flags, 'ledger') ?? DEFAULT_LEDGER_PATH);
  const report = computeCoverage(corpus, ledger);
  const out = flagString(flags, 'out') ?? DEFAULT_COVERAGE_PATH;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(summarize(report));
  const schemaErrors = issues.filter((i) => i.level === 'error').length;
  if (schemaErrors > 0) console.log(`note: ${schemaErrors} file(s) failed loading and are not counted (run content:validate)`);
  console.log(`wrote ${out}`);
}

if (isMain(import.meta.url)) main();
