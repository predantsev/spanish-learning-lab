// Theme: light by default, the system dark preference is respected, an explicit choice overrides it.
// `system` removes data-theme so the prefers-color-scheme rules in tokens.css apply.

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'sll-theme';

export function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private mode); the server profile remains the source of truth.
  }
}

/** Applies the last known preference before first render to avoid a theme flash. */
export function applyStoredTheme(): void {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') applyTheme(stored);
  } catch {
    // ignore
  }
}
