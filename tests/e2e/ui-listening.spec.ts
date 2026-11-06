// A-21: playback only by user gesture, neutral replay/speed, transcript as recorded support,
// audio failure → retry + written alternative that is not a listening pass; never the microphone.
import { expect, test } from '@playwright/test';
import { commandBody, fixture, openExercise, signIn, useRealService, waitForCommand } from './ui-helpers.ts';

useRealService();

const LISTENING_TASK = fixture('SLL_E2E_LISTENING_TASK');

test.beforeEach(async ({ page }) => {
  test.skip(!LISTENING_TASK, 'SLL_E2E_LISTENING_TASK not set');
  await page.addInitScript(() => {
    const flags = window as unknown as { __sllMic: number };
    flags.__sllMic = 0;
    const devices = navigator.mediaDevices;
    if (devices && devices.getUserMedia) {
      const original = devices.getUserMedia.bind(devices);
      devices.getUserMedia = (constraints?: MediaStreamConstraints) => {
        flags.__sllMic += 1;
        return original(constraints);
      };
    }
  });
  await signIn(page);
});

test('no autoplay; play, replay and speed are explicit and replay/speed are recorded as neutral', async ({ page }) => {
  await openExercise(page, LISTENING_TASK as string);
  const player = page.getByTestId('listening-player').first();
  await expect(player).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await page.locator('audio').first().evaluate((audio: HTMLAudioElement) => audio.paused && audio.currentTime === 0)).toBe(true);
  await player.getByRole('button', { name: 'Відтворити' }).click();
  await expect(player).toHaveAttribute('data-state', /playing|ended|error/);
  test.skip((await player.getAttribute('data-state')) === 'error', 'Local clip could not play in this environment');
  const replay = waitForCommand(page, 'support.observe');
  await player.getByRole('button', { name: 'Ще раз' }).click();
  expect(commandBody(await replay).payload['kind']).toBe('replay');
  const speed = waitForCommand(page, 'support.observe');
  await player.getByRole('button', { name: /Повільніше/ }).click();
  expect(commandBody(await speed).payload['kind']).toBe('speed-change');
  expect(await page.locator('audio').first().evaluate((audio: HTMLAudioElement) => audio.playbackRate)).toBeCloseTo(0.85);
  expect(await page.evaluate(() => (window as unknown as { __sllMic: number }).__sllMic)).toBe(0);
});

test('transcript is requested and recorded as support for the listening target', async ({ page }) => {
  await openExercise(page, LISTENING_TASK as string);
  const transcript = page.getByRole('button', { name: 'Текст запису' }).first();
  test.skip((await transcript.count()) === 0, 'The task has no transcript help');
  const requested = waitForCommand(page, 'support.request');
  await transcript.click();
  expect(commandBody(await requested).payload['kind']).toBe('transcript');
  await expect(page.getByTestId('support-item').first()).toBeVisible();
});

test('a missing clip offers retry and a written alternative that does not assess listening', async ({ page }) => {
  await page.route('**/api/v1/media/**', (route) => route.abort());
  await openExercise(page, LISTENING_TASK as string);
  const player = page.getByTestId('listening-player').first();
  await player.getByRole('button', { name: 'Відтворити' }).click();
  await expect(player).toHaveAttribute('data-state', 'error');
  await expect(player.getByRole('button', { name: 'Спробувати відтворити ще раз' })).toBeVisible();
  await player.getByRole('button', { name: /Письмовий варіант/ }).click();
  await expect(page.getByTestId('written-alternative')).toContainText(/не перевіряє слухання|не вважається помилкою/);
  // The answer area stays usable; nothing was submitted automatically.
  await expect(page.getByTestId('result-panel')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __sllMic: number }).__sllMic)).toBe(0);
});

test('dictation, when it is the task, keeps its own draft and Enter adds a newline', async ({ page }) => {
  await openExercise(page, LISTENING_TASK as string);
  const dictation = page.getByText('Диктант (необов\'язково)').first();
  test.skip((await dictation.count()) === 0, 'The fixture task is a meaning task, not dictation');
  const input = page.getByTestId('answer-input');
  await input.click();
  await page.keyboard.type('Uno');
  await page.keyboard.press('Enter');
  await page.keyboard.type('dos');
  await expect(input).toHaveValue('Uno\ndos');
  await expect(page.getByRole('button', { name: 'Пропустити диктант' })).toBeVisible();
});
