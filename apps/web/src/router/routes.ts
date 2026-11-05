// Route table for the tiny history router. Pure: no DOM access, unit-testable.

export type Route =
  | { readonly name: 'home' }
  | { readonly name: 'catalog'; readonly lessonId?: string }
  | { readonly name: 'lesson'; readonly lessonId: string; readonly stepId?: string }
  | { readonly name: 'exercise'; readonly taskRevisionId: string }
  | { readonly name: 'review' }
  | { readonly name: 'practice'; readonly setId: string }
  | { readonly name: 'listening' }
  | { readonly name: 'phrases'; readonly phraseId?: string }
  | { readonly name: 'collection'; readonly collectionId: string }
  | { readonly name: 'materials'; readonly topicId: string }
  | { readonly name: 'progress' }
  | { readonly name: 'settings' }
  | { readonly name: 'settings-agents' }
  | { readonly name: 'settings-recovery' }
  | { readonly name: 'not-found'; readonly path: string };

export type RouteName = Route['name'];

function decode(segment: string): string | null {
  try {
    const value = decodeURIComponent(segment);
    return value.length > 0 && value.length <= 200 ? value : null;
  } catch {
    return null;
  }
}

export function parseRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const parts = clean.split('/').filter((part) => part.length > 0);
  const [first, second, third, ...rest] = parts;
  const notFound: Route = { name: 'not-found', path: clean };
  if (parts.length === 0) return { name: 'home' };
  const a = second === undefined ? undefined : decode(second);
  const b = third === undefined ? undefined : decode(third);
  if (a === null || b === null || rest.length > 0) return notFound;

  switch (first) {
    case 'catalog':
      if (third !== undefined) return notFound;
      return a === undefined ? { name: 'catalog' } : { name: 'catalog', lessonId: a };
    case 'lesson':
      if (a === undefined) return notFound;
      return b === undefined ? { name: 'lesson', lessonId: a } : { name: 'lesson', lessonId: a, stepId: b };
    case 'exercise':
      return a !== undefined && b === undefined ? { name: 'exercise', taskRevisionId: a } : notFound;
    case 'review':
      return a === undefined ? { name: 'review' } : notFound;
    case 'practice':
      return a !== undefined && b === undefined ? { name: 'practice', setId: a } : notFound;
    case 'listening':
      return a === undefined ? { name: 'listening' } : notFound;
    case 'phrases':
      if (b !== undefined) return notFound;
      return a === undefined ? { name: 'phrases' } : { name: 'phrases', phraseId: a };
    case 'collections':
      return a !== undefined && b === undefined ? { name: 'collection', collectionId: a } : notFound;
    case 'materials':
      return a !== undefined && b === undefined ? { name: 'materials', topicId: a } : notFound;
    case 'progress':
      return a === undefined ? { name: 'progress' } : notFound;
    case 'settings':
      if (a === undefined) return { name: 'settings' };
      if (b !== undefined) return notFound;
      if (a === 'agents') return { name: 'settings-agents' };
      if (a === 'recovery') return { name: 'settings-recovery' };
      return notFound;
    default:
      return notFound;
  }
}

const enc = encodeURIComponent;

/** Builders keep every link in one place so route shapes cannot drift. */
export const paths = {
  home: () => '/',
  catalog: (lessonId?: string) => (lessonId ? `/catalog/${enc(lessonId)}` : '/catalog'),
  lesson: (lessonId: string, stepId?: string) =>
    stepId ? `/lesson/${enc(lessonId)}/${enc(stepId)}` : `/lesson/${enc(lessonId)}`,
  exercise: (taskRevisionId: string, query?: Readonly<Record<string, string | undefined>>) =>
    withQuery(`/exercise/${enc(taskRevisionId)}`, query),
  review: () => '/review',
  practice: (setId: string) => `/practice/${enc(setId)}`,
  listening: () => '/listening',
  phrases: (phraseId?: string) => (phraseId ? `/phrases/${enc(phraseId)}` : '/phrases'),
  collection: (collectionId: string) => `/collections/${enc(collectionId)}`,
  materials: (topicId: string, query?: Readonly<Record<string, string | undefined>>) =>
    withQuery(`/materials/${enc(topicId)}`, query),
  progress: () => '/progress',
  settings: () => '/settings',
  settingsAgents: () => '/settings/agents',
  settingsRecovery: () => '/settings/recovery',
};

export function withQuery(path: string, query?: Readonly<Record<string, string | undefined>>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

/** Top-level navigation section a route belongs to (for the active nav item). */
export function sectionOf(route: Route): 'home' | 'course' | 'practice' | 'phrases' | 'progress' | 'settings' | null {
  switch (route.name) {
    case 'home':
      return 'home';
    case 'catalog':
    case 'lesson':
    case 'materials':
      return 'course';
    case 'exercise':
    case 'review':
    case 'practice':
    case 'listening':
      return 'practice';
    case 'phrases':
    case 'collection':
      return 'phrases';
    case 'progress':
      return 'progress';
    case 'settings':
    case 'settings-agents':
    case 'settings-recovery':
      return 'settings';
    default:
      return null;
  }
}

/**
 * Only same-origin, relative application routes may be opened from server-provided route strings
 * (e.g. Receipt.route). Anything else is ignored rather than navigated to.
 */
export function safeAppRoute(route: string | undefined): string | null {
  if (!route || !route.startsWith('/') || route.startsWith('//')) return null;
  const [pathname] = route.split(/[?#]/);
  if (!pathname) return null;
  return parseRoute(pathname).name === 'not-found' ? null : route;
}
