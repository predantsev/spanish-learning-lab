// GET /catalog: lessons and optional checks with Ukrainian titles, Spanish terms and explicit aliases
// (skill forms/terms, lexicon lemmas). Search is accent-insensitive (search only — never grading).
// Opaque cursors are HMAC-bound to the filter + catalog revision and expire after 15 minutes.
import type { CatalogEntry, CatalogPage, Target } from '@sll/contracts';
import { hmac, safeEqual } from '../auth/crypto.ts';
import { canonicalJson, sha256Hex } from '../content/pack-format.ts';
import { contractContentState, type ContentRepository } from '../content/repository.ts';
import { LISTENING_MODALITIES, type LessonBody, type LexemeBody, type SkillBody, type TaskBody } from '../content/types.ts';
import { HttpError, conflict } from '../http/errors.ts';

export const CURSOR_TTL_MS = 15 * 60_000;

export interface CatalogQuery {
  readonly query?: string;
  readonly block?: string;
  readonly situation?: string;
  readonly mode?: 'written' | 'listening' | 'mixed';
  readonly cursor?: string;
  readonly limit: number;
}

export function foldForSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

interface IndexedEntry {
  readonly entry: CatalogEntry;
  readonly haystack: string;
  readonly written: boolean;
  readonly listening: boolean;
}

function buildIndex(repo: ContentRepository): IndexedEntry[] {
  const skills = new Map(repo.skills().map((s) => [s.logicalId, s.body as SkillBody]));
  const lexemes = repo.listActive<LexemeBody>('lexeme').map((l) => l.body);
  const tasks = repo.tasks();
  return repo.lessons().map((l) => {
    const body: LessonBody = l.body;
    const introduced = body.introduces.map((id) => skills.get(id)).filter((s): s is SkillBody => s !== undefined);
    const targets: Target[] = introduced.filter((s) => s.assessed).flatMap((s) => s.modalities.map((modality) => ({ skillId: s.skillId, modality }))).slice(0, 100);
    const lessonTasks = tasks.filter((t) => t.body.lessonId === body.id).map((t) => t.body as TaskBody);
    const listeningTask = (t: TaskBody): boolean => (t.clipIds?.length ?? 0) > 0 || t.targets.some((x) => LISTENING_MODALITIES.has(x.modality));
    const termEs = body.termEs && body.termEs.length > 0 ? body.termEs : (introduced.find((s) => s.termEs)?.termEs ?? body.titleUk);
    const aliases = [
      body.titleUk,
      termEs,
      body.summaryUk,
      ...introduced.flatMap((s) => [s.titleUk, s.termEs ?? '', ...(s.scope.forms ?? []), s.skillId]),
      ...lexemes.filter((x) => x.firstLesson === body.id).flatMap((x) => [x.lemma, x.meaningUk]),
    ];
    return {
      entry: {
        id: body.id,
        titleUk: body.titleUk.slice(0, 160),
        termEs: termEs.slice(0, 160),
        blockId: body.blockId,
        situationIds: [...body.situations].slice(0, 20),
        targets,
        state: contractContentState(l.state),
      },
      haystack: foldForSearch(aliases.join(' \u0001 ')),
      written: lessonTasks.some((t) => !listeningTask(t)),
      listening: lessonTasks.some(listeningTask) || body.steps.some((s) => (s.clipIds?.length ?? 0) > 0),
    };
  });
}

interface CursorPayload {
  readonly o: number;
  readonly f: string;
  readonly r: number;
  readonly e: number;
}

function encodeCursor(key: string, p: CursorPayload): string {
  const data = Buffer.from(JSON.stringify(p)).toString('base64url');
  return `${data}.${hmac(key, data)}`;
}

function decodeCursor(key: string, cursor: string): CursorPayload {
  const [data, sig] = cursor.split('.');
  if (!data || !sig || !safeEqual(hmac(key, data), sig)) throw conflict('STALE_CURSOR');
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as CursorPayload;
  } catch {
    throw new HttpError(409, 'STALE_CURSOR');
  }
}

export function catalogPage(repo: ContentRepository, q: CatalogQuery, cursorKey: string, now: Date): CatalogPage {
  const revision = repo.catalogRevision();
  const filterHash = sha256Hex(canonicalJson({ query: q.query ?? '', block: q.block ?? '', situation: q.situation ?? '', mode: q.mode ?? '' }));
  let offset = 0;
  if (q.cursor !== undefined) {
    const c = decodeCursor(cursorKey, q.cursor);
    if (c.e <= now.getTime() || c.f !== filterHash || c.r !== revision) throw conflict('STALE_CURSOR');
    offset = c.o;
  }
  const tokens = q.query ? foldForSearch(q.query).split(' ').filter((t) => t.length > 0) : [];
  const matches = buildIndex(repo).filter(
    (x) =>
      (q.block === undefined || x.entry.blockId === q.block) &&
      (q.situation === undefined || x.entry.situationIds.includes(q.situation)) &&
      (q.mode === undefined || q.mode === 'mixed' || (q.mode === 'written' ? x.written : x.listening)) &&
      tokens.every((t) => x.haystack.includes(t)),
  );
  const items = matches.slice(offset, offset + q.limit).map((x) => x.entry);
  const next = offset + q.limit < matches.length ? encodeCursor(cursorKey, { o: offset + q.limit, f: filterHash, r: revision, e: now.getTime() + CURSOR_TTL_MS }) : '';
  return { items, nextCursor: next, revision };
}
