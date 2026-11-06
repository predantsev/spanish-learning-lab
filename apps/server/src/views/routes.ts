// Owner-session-only browser views (/views/*). Never granted to agent tokens; never mutating.
import type { FastifyInstance } from 'fastify';
import type { ServerState } from '../state.ts';
import { ContentRepository } from '../content/repository.ts';
import { localDate } from '@sll/domain';
import { notFound } from '../http/errors.ts';
import { ok, UUID_RE } from '../http/reply.ts';
import { exerciseView, homeView, lessonView, listeningView, materialsView, phraseLibraryView, progressView } from './builders.ts';
import { attemptResultView, catalogMetaView } from './results.ts';

const API = '/api/v1';
const LESSON_ID = /^A[12]-0[1-8]-(L[0-9]{1,2}|C1)$/;
const TOPIC_ID = /^A[12]-0[1-8](-(L[0-9]{1,2}|C1))?$/;

export function registerViewRoutes(app: FastifyInstance, state: ServerState): void {
  const cfg = (op: string) => ({ config: { op, auth: 'owner' as const } });
  const ctx = () => {
    const db = state.store.db();
    const profile = state.store.profile();
    return { db, repo: new ContentRepository(db), epoch: profile.epoch, today: localDate(state.now().toISOString(), profile.reviewTimezone) };
  };

  app.get(`${API}/views/home`, cfg('views.home'), async (request) => {
    const c = ctx();
    return ok(request, c.epoch, homeView(c.db, c.repo, c.today));
  });

  app.get<{ Params: { lessonId: string } }>(`${API}/views/lessons/:lessonId`, cfg('views.lesson'), async (request) => {
    if (!LESSON_ID.test(request.params.lessonId)) throw notFound('LESSON_NOT_FOUND');
    const c = ctx();
    return ok(request, c.epoch, lessonView(c.db, c.repo, request.params.lessonId));
  });

  app.get<{ Params: { taskRevisionId: string } }>(`${API}/views/exercises/:taskRevisionId`, cfg('views.exercise'), async (request) => {
    if (!UUID_RE.test(request.params.taskRevisionId)) throw notFound('TASK_NOT_FOUND');
    const c = ctx();
    return ok(request, c.epoch, exerciseView(c.repo, request.params.taskRevisionId));
  });

  app.get(`${API}/views/progress`, cfg('views.progress'), async (request) => {
    const c = ctx();
    return ok(request, c.epoch, progressView(c.db, c.repo));
  });

  app.get(`${API}/views/phrases`, cfg('views.phrases'), async (request) => {
    const c = ctx();
    return ok(request, c.epoch, phraseLibraryView(c.db, c.repo));
  });

  app.get<{ Params: { topicId: string } }>(`${API}/views/materials/:topicId`, cfg('views.materials'), async (request) => {
    if (!TOPIC_ID.test(request.params.topicId)) throw notFound('TOPIC_NOT_FOUND');
    const c = ctx();
    return ok(request, c.epoch, materialsView(c.repo, request.params.topicId));
  });

  app.get(`${API}/views/listening`, cfg('views.listening'), async (request) => {
    const c = ctx();
    return ok(request, c.epoch, listeningView(c.db, c.repo, c.today));
  });

  app.get(`${API}/views/catalog-meta`, cfg('views.catalogMeta'), async (request) => {
    const c = ctx();
    return ok(request, c.epoch, catalogMetaView(c.repo));
  });

  app.get<{ Params: { attemptId: string } }>(`${API}/views/attempts/:attemptId`, cfg('views.attempt'), async (request) => {
    if (!UUID_RE.test(request.params.attemptId)) throw notFound('ATTEMPT_NOT_FOUND');
    const c = ctx();
    return ok(request, c.epoch, attemptResultView(c.db, c.repo, request.params.attemptId));
  });
}
