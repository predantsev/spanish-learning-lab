// Answer-submission keyboard rules (C-056, A-18). Pure and unit-tested.
// Short answers: Enter checks. Multiline answers: Enter inserts a newline; Cmd+Enter on macOS/iOS,
// Ctrl+Enter elsewhere checks. IME composition and auto-repeated (held) keys never submit.

export type AnswerInputKind = 'short' | 'multiline' | 'options';
export type KeyboardPlatform = 'mac' | 'other';

export interface KeyLike {
  readonly key: string;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly repeat?: boolean;
  readonly isComposing?: boolean;
  /** Legacy keyCode; 229 is reported while an IME is composing in some browsers (Safari). */
  readonly keyCode?: number;
}

export function isImeComposing(event: KeyLike): boolean {
  return event.isComposing === true || event.keyCode === 229;
}

export function shouldSubmitAnswer(event: KeyLike, kind: AnswerInputKind, platform: KeyboardPlatform): boolean {
  if (event.key !== 'Enter') return false;
  if (isImeComposing(event)) return false;
  if (event.repeat === true) return false;
  if (event.altKey) return false;
  switch (kind) {
    case 'short':
      return !event.metaKey && !event.ctrlKey;
    case 'multiline':
      return platform === 'mac' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
    case 'options':
      return false;
  }
}

/** Locale key of the visible shortcut reminder shown beside the Check button. */
export function shortcutHintKey(kind: AnswerInputKind, platform: KeyboardPlatform): string | null {
  if (kind === 'short') return 'exercise.shortcut.enter';
  if (kind === 'multiline') return platform === 'mac' ? 'exercise.shortcut.cmdEnter' : 'exercise.shortcut.ctrlEnter';
  return null;
}

export function detectPlatform(nav: { readonly platform?: string; readonly userAgent?: string } | undefined): KeyboardPlatform {
  if (!nav) return 'other';
  const data = nav as { userAgentData?: { platform?: string } };
  const value = data.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(value) ? 'mac' : 'other';
}
