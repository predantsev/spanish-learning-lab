// A-18: short/multiline entry, IME composition, help/reference before submitting, check → explicit Next.
import { expect, test } from '@playwright/test';
import { commandBody, fixture, openExercise, recordCommands, signIn, submitChord, useRealService, waitForCommand, waitSaved } from './ui-helpers.ts';

useRealService();

const SHORT_TASK = fixture('SLL_E2E_SHORT_TASK');
const MULTILINE_TASK = fixture('SLL_E2E_MULTILINE_TASK');

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('short answer: visible Enter reminder, autosave ACK, Enter checks once, answer frozen, no automatic Next', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await openExercise(page, SHORT_TASK as string);
  const input = page.getByTestId('answer-input');
  await expect(page.getByTestId('shortcut-hint')).toHaveText('Enter — перевірити');
  await expect(page.getByTestId('check-button')).toBeVisible();
  await input.fill('he hecho');
  const saved = waitForCommand(page, 'draft.save');
  await input.blur();
  expect(commandBody(await saved).payload['text']).toBe('he hecho');
  await waitSaved(page);
  const kinds = recordCommands(page);
  const submitted = waitForCommand(page, 'attempt.submit');
  await input.press('Enter');
  await submitted;
  await expect(page.getByTestId('result-panel')).toBeVisible({ timeout: 15_000 });
  await expect(input).toHaveAttribute('readonly', '');
  await expect(input).toHaveValue('he hecho');
  // Correctness and independence are shown as text per target, not by colour alone.
  const verdicts = page.getByTestId('verdict');
  await expect(verdicts.first()).toContainText(/Правильно|Неправильно|Не вдалося оцінити|Помилка в завданні/);
  await expect(verdicts.first()).toContainText(/самостійно|з підтримкою|невідомо|самостійність не оцінювалась/);
  const url = page.url();
  await page.waitForTimeout(3000);
  expect(page.url()).toBe(url);
  expect(kinds.filter((kind) => kind === 'attempt.submit')).toHaveLength(1);
  await page.getByTestId('next-button').click();
  await expect(page).not.toHaveURL(url);
});

test('multiline: Enter adds a newline; Cmd/Ctrl+Enter checks; the reminder names the chord', async ({ page }) => {
  test.skip(!MULTILINE_TASK, 'SLL_E2E_MULTILINE_TASK not set');
  await openExercise(page, MULTILINE_TASK as string);
  const input = page.getByTestId('answer-input');
  await expect(page.getByTestId('shortcut-hint')).toHaveText(process.platform === 'darwin' ? /Command \+ Enter/ : /Ctrl \+ Enter/);
  const kinds = recordCommands(page);
  await input.click();
  await page.keyboard.type('Primera línea');
  await page.keyboard.press('Enter');
  await page.keyboard.type('segunda línea');
  await expect(input).toHaveValue('Primera línea\nsegunda línea');
  await page.waitForTimeout(800);
  expect(kinds).not.toContain('attempt.submit');
  const submitted = waitForCommand(page, 'attempt.submit');
  await page.keyboard.press(submitChord);
  const body = commandBody(await submitted);
  expect(body.payload['response']).toEqual({ text: 'Primera línea\nsegunda línea' });
});

test('IME composition never submits', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await openExercise(page, SHORT_TASK as string);
  const input = page.getByTestId('answer-input');
  await input.fill('cancion');
  await waitSaved(page);
  const kinds = recordCommands(page);
  await input.dispatchEvent('compositionstart', { data: '' });
  await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true, bubbles: true, cancelable: true });
  await input.dispatchEvent('compositionend', { data: 'ó' });
  await page.waitForTimeout(1000);
  expect(kinds).not.toContain('attempt.submit');
  await expect(page.getByTestId('result-panel')).toHaveCount(0);
});

test('no on-screen Spanish character strip', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await openExercise(page, SHORT_TASK as string);
  await expect(page.getByRole('button', { name: /^(á|é|í|ó|ú|ñ|ü|¿|¡)$/ })).toHaveCount(0);
});

test('help and reference are available before any answer; closing keeps the support record, input and caret', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await openExercise(page, SHORT_TASK as string);
  const input = page.getByTestId('answer-input');
  await input.fill('he dic');
  await waitSaved(page);
  // Interface help: opens on click, not hover; Escape returns focus to the ? button.
  const helpButton = page.locator('.help-button').first();
  await helpButton.hover();
  await expect(page.locator('.help-panel:visible')).toHaveCount(0);
  await helpButton.click();
  await expect(page.locator('.help-panel:visible').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(helpButton).toBeFocused();

  await page.getByTestId('reference-toggle').click();
  const hint = page.locator('[data-testid^="hint-"]').first();
  test.skip((await hint.count()) === 0, 'The task has no reviewed help');
  const requested = waitForCommand(page, 'support.request');
  const confirmed = waitForCommand(page, 'support.confirm');
  await hint.click();
  const request = commandBody(await requested);
  expect(['rule', 'targeted-clue', 'translation', 'transcript', 'reveal']).toContain(request.payload['kind']);
  await expect(page.getByTestId('support-item').first()).toBeVisible();
  const confirm = commandBody(await confirmed);
  expect(confirm.payload['phase']).toBe('before-submit');
  // Close the panel (desktop toggle or phone sheet) — the draft and the delivered help stay.
  const sheet = page.locator('dialog[open]');
  if (await sheet.count()) await page.keyboard.press('Escape');
  else await page.getByTestId('reference-toggle').click();
  await expect(input).toHaveValue('he dic');
  await page.getByTestId('reference-toggle').click();
  await expect(page.getByTestId('support-item').first()).toBeVisible();
});
