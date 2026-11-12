import { describe, expect, it } from 'vitest';
import {
  detectPlatform,
  shortcutHintKey,
  shouldSubmitAnswer,
  type KeyLike,
} from '../../apps/web/src/lib/keyboard.ts';

const key = (overrides: Partial<KeyLike> = {}): KeyLike => ({
  key: 'Enter',
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  isComposing: false,
  keyCode: 13,
  ...overrides,
});

describe('answer submit keys (C-056)', () => {
  it('short answers: plain Enter checks', () => {
    expect(shouldSubmitAnswer(key(), 'short', 'mac')).toBe(true);
    expect(shouldSubmitAnswer(key(), 'short', 'other')).toBe(true);
    expect(shouldSubmitAnswer(key({ shiftKey: true }), 'short', 'other')).toBe(true);
  });

  it('short answers: modified Enter or other keys do not check', () => {
    expect(shouldSubmitAnswer(key({ metaKey: true }), 'short', 'mac')).toBe(false);
    expect(shouldSubmitAnswer(key({ ctrlKey: true }), 'short', 'other')).toBe(false);
    expect(shouldSubmitAnswer(key({ altKey: true }), 'short', 'other')).toBe(false);
    expect(shouldSubmitAnswer(key({ key: 'a' }), 'short', 'other')).toBe(false);
  });

  it('multiline: Enter is a newline; Cmd+Enter (Mac) / Ctrl+Enter (elsewhere) checks', () => {
    expect(shouldSubmitAnswer(key(), 'multiline', 'mac')).toBe(false);
    expect(shouldSubmitAnswer(key(), 'multiline', 'other')).toBe(false);
    expect(shouldSubmitAnswer(key({ metaKey: true }), 'multiline', 'mac')).toBe(true);
    expect(shouldSubmitAnswer(key({ ctrlKey: true }), 'multiline', 'mac')).toBe(false);
    expect(shouldSubmitAnswer(key({ ctrlKey: true }), 'multiline', 'other')).toBe(true);
    expect(shouldSubmitAnswer(key({ metaKey: true }), 'multiline', 'other')).toBe(false);
  });

  it('IME composition never submits (isComposing or keyCode 229)', () => {
    expect(shouldSubmitAnswer(key({ isComposing: true }), 'short', 'mac')).toBe(false);
    expect(shouldSubmitAnswer(key({ keyCode: 229 }), 'short', 'other')).toBe(false);
    expect(shouldSubmitAnswer(key({ isComposing: true, metaKey: true }), 'multiline', 'mac')).toBe(false);
    expect(shouldSubmitAnswer(key({ keyCode: 229, ctrlKey: true }), 'multiline', 'other')).toBe(false);
  });

  it('a held (auto-repeated) key never submits twice', () => {
    expect(shouldSubmitAnswer(key({ repeat: true }), 'short', 'other')).toBe(false);
    expect(shouldSubmitAnswer(key({ repeat: true, metaKey: true }), 'multiline', 'mac')).toBe(false);
  });

  it('choice tasks are never submitted by Enter in the option list', () => {
    expect(shouldSubmitAnswer(key(), 'options', 'other')).toBe(false);
  });

  it('shortcut reminder keys follow the platform', () => {
    expect(shortcutHintKey('short', 'mac')).toBe('exercise.shortcut.enter');
    expect(shortcutHintKey('multiline', 'mac')).toBe('exercise.shortcut.cmdEnter');
    expect(shortcutHintKey('multiline', 'other')).toBe('exercise.shortcut.ctrlEnter');
    expect(shortcutHintKey('options', 'other')).toBeNull();
  });

  it('detects Apple platforms', () => {
    expect(detectPlatform({ platform: 'MacIntel' })).toBe('mac');
    expect(detectPlatform({ platform: 'iPhone' })).toBe('mac');
    expect(detectPlatform({ platform: 'Win32' })).toBe('other');
    expect(detectPlatform(undefined)).toBe('other');
  });
});
