// Session/practice flows shared by Home, Catalog, Lesson, Listening, Phrases and Materials.
// Scope is always exactly what the learner selected: these helpers never widen targets or modes.
import type { ApiClient } from '../api/client.ts';
import { makeCommand, receiptEntity, type CommandOf } from '../api/commands.ts';
import { ApiRequestError } from '../api/errors.ts';
import type { LearningSession, LessonView, PracticeSet, Receipt, Target } from '../api/types.ts';
import { newId } from '../lib/ids.ts';
import { paths, safeAppRoute } from '../router/routes.ts';

type SessionPayload = CommandOf<'session.start'>['payload'];

export function sessionStartCommand(epoch: number, payload: SessionPayload): CommandOf<'session.start'> {
  return makeCommand('session.start', epoch, { subjectId: newId(), expectedRevision: 0, payload });
}

export function minutesBucket(minutes: number): 5 | 10 | 20 {
  if (minutes <= 5) return 5;
  if (minutes <= 10) return 10;
  return 20;
}

export async function sessionFromReceipt(api: ApiClient, receipt: Receipt): Promise<LearningSession> {
  const ref = receiptEntity(receipt, 'session');
  if (!ref) throw new ApiRequestError('invalid-response', 200);
  return api.resource<LearningSession>('session', ref.id);
}

/** Exercise route for a task inside a session (optionally inside a lesson step). */
export function taskRoute(
  session: LearningSession,
  taskRevisionId: string,
  extra: Readonly<Record<string, string | undefined>> = {},
): string {
  return paths.exercise(taskRevisionId, { session: session.id, ...extra });
}

export function firstTaskRoute(session: LearningSession): string | null {
  const first = session.taskRevisionIds[0];
  return first ? taskRoute(session, first) : null;
}

export function practiceCreateCommand(
  epoch: number,
  targets: readonly Target[],
  mode: 'written' | 'listening' | 'mixed',
  maxItems: number,
  phraseIds: readonly string[] = [],
): CommandOf<'practice.create'> {
  return makeCommand('practice.create', epoch, {
    subjectId: newId(),
    expectedRevision: 0,
    payload: {
      targets: targets.slice(0, 30),
      mode,
      maxItems: Math.max(1, Math.min(30, Math.round(maxItems))),
      phraseIds: phraseIds.slice(0, 100),
    },
  });
}

/** Route opened after practice.create: the service route when it is a known app route, else /practice/:id. */
export function practiceRouteFromReceipt(receipt: Receipt): string | null {
  const route = safeAppRoute(receipt.route);
  if (route) return route;
  const ref = receiptEntity(receipt, 'practice-set');
  return ref ? paths.practice(ref.id) : null;
}

export function practiceSessionPayload(set: PracticeSet): SessionPayload {
  return {
    source: 'practice-set',
    sourceId: set.id,
    targets: set.targets.slice(0, 100),
    mode: set.mode === 'listening' ? 'listening' : 'practice',
    minutes: 10,
    maxItems: Math.max(1, Math.min(30, set.taskRevisionIds.length || 10)),
  };
}

export function lessonSessionPayload(lesson: LessonView, mode: 'learn' | 'listening' = 'learn'): SessionPayload {
  const tasks = lesson.steps.reduce((sum, step) => sum + step.tasks.length, 0);
  return {
    source: 'lesson',
    sourceId: lesson.revisionId,
    targets: [],
    mode,
    minutes: minutesBucket(lesson.estimatedMinutes),
    maxItems: Math.max(1, Math.min(30, tasks || 1)),
  };
}

const LESSON_SESSION_PREFIX = 'sll-lesson-session:';

/** Per-tab convenience cache of the learn session for a lesson revision (the service stays authoritative). */
export function rememberedLessonSession(revisionId: string): string | null {
  try {
    return window.sessionStorage.getItem(LESSON_SESSION_PREFIX + revisionId);
  } catch {
    return null;
  }
}

export function rememberLessonSession(revisionId: string, sessionId: string): void {
  try {
    window.sessionStorage.setItem(LESSON_SESSION_PREFIX + revisionId, sessionId);
  } catch {
    // ignore: a new session is created next time
  }
}

/** Starts (or reuses) the learn session of a lesson and returns it. */
export async function ensureLessonSession(
  api: ApiClient,
  lesson: LessonView,
  mode: 'learn' | 'listening' = 'learn',
): Promise<LearningSession> {
  const remembered = rememberedLessonSession(lesson.revisionId);
  if (remembered) {
    try {
      const session = await api.resource<LearningSession>('session', remembered);
      if (session.status === 'active') return session;
    } catch {
      // fall through to a new session
    }
  }
  const receipt = await api.command(sessionStartCommand(api.profileEpoch, lessonSessionPayload(lesson, mode)));
  const session = await sessionFromReceipt(api, receipt);
  rememberLessonSession(lesson.revisionId, session.id);
  return session;
}
