// Tiny history router: pushState/popstate, leave listeners (draft flush) and scroll restoration.
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

export interface LocationSnapshot {
  readonly pathname: string;
  readonly search: string;
  readonly key: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();
const leaveListeners = new Set<() => void>();
const scrollPositions = new Map<string, number>();
let snapshot: LocationSnapshot = readLocation();
let depth = 0;

function readLocation(): LocationSnapshot {
  if (typeof window === 'undefined') return { pathname: '/', search: '', key: 'ssr' };
  const state = window.history.state as { key?: unknown } | null;
  const key = state && typeof state.key === 'string' ? state.key : 'initial';
  return { pathname: window.location.pathname, search: window.location.search, key };
}

function emit(): void {
  snapshot = readLocation();
  for (const listener of listeners) listener();
}

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function notifyLeave(): void {
  for (const listener of leaveListeners) {
    try {
      listener();
    } catch {
      // A leave listener must never block navigation.
    }
  }
}

let installed = false;
export function installHistory(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  if (!(window.history.state as { key?: unknown } | null)?.key) {
    window.history.replaceState({ key: 'initial' }, '', window.location.href);
  }
  snapshot = readLocation();
  window.addEventListener('popstate', () => {
    notifyLeave();
    depth = Math.max(0, depth - 1);
    emit();
    const y = scrollPositions.get(snapshot.key);
    window.requestAnimationFrame(() => window.scrollTo(0, y ?? 0));
  });
  window.addEventListener('pagehide', notifyLeave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') notifyLeave();
  });
}

export interface NavigateOptions {
  readonly replace?: boolean;
  /** Keep the current scroll position (list/detail selection on the same screen). */
  readonly keepScroll?: boolean;
}

export function navigate(to: string, options: NavigateOptions = {}): void {
  if (typeof window === 'undefined') return;
  notifyLeave();
  scrollPositions.set(snapshot.key, window.scrollY);
  const key = newKey();
  if (options.replace) {
    window.history.replaceState({ key }, '', to);
  } else {
    window.history.pushState({ key }, '', to);
    depth += 1;
  }
  emit();
  if (!options.keepScroll) window.scrollTo(0, 0);
}

/** Goes back inside the app when possible, otherwise to the given fallback route. */
export function goBack(fallback: string): void {
  if (typeof window !== 'undefined' && depth > 0) {
    window.history.back();
  } else {
    navigate(fallback, { replace: true });
  }
}

/** Registers a callback that runs before every route change or page hide (e.g. flush a draft). */
export function addLeaveListener(listener: () => void): () => void {
  leaveListeners.add(listener);
  return () => leaveListeners.delete(listener);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocation(): LocationSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function useSearchParams(): URLSearchParams {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  readonly to: string;
  readonly replace?: boolean;
  readonly keepScroll?: boolean;
  readonly children?: ReactNode;
}

export function Link({ to, replace, keepScroll, onClick, children, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainLeftClick(event)) return;
        event.preventDefault();
        navigate(to, { replace, keepScroll });
      }}
    >
      {children}
    </a>
  );
}
