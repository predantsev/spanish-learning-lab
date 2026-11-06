// A-20: optional discoverable materials with statuses, no automatic navigation, typed rendering only
// (no script execution, no injected attributes), answer preserved when returning to the exercise.
// Fixture expectation: the synthetic topic includes a material whose text fields contain markup such
// as `<img src=x onerror="window.__sllXss=1"><script>window.__sllXss=1</script>`; rendered as text,
// it must leave window.__sllXss at 0 and create no elements.
import { expect, test } from '@playwright/test';
import { fixture, openExercise, signIn, useRealService, waitSaved } from './ui-helpers.ts';

useRealService();

const TOPIC = fixture('SLL_E2E_TOPIC') ?? 'A2-03';
const SHORT_TASK = fixture('SLL_E2E_SHORT_TASK');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __sllXss: number }).__sllXss = 0;
  });
  await signIn(page);
});

test('materials list shows statuses and never opens a material by itself', async ({ page }) => {
  await page.goto(`/materials/${TOPIC}`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page).not.toHaveURL(/material=/);
  await expect(page.getByTestId('material-reader')).toHaveCount(0);
  await page.getByRole('button', { name: 'Усі', exact: true }).click();
  for (const item of await page.getByTestId('material-item').all()) {
    await expect(item.locator('.badge').first()).toContainText(/Готово|Чернетка|Очікує перевірки|Перевірено|Вилучено|Призупинено/);
  }
  await page.getByRole('button', { name: 'Оновити список' }).click();
  await expect(page).not.toHaveURL(/material=/);
});

test('every material renders as typed text: no script, handler attribute, frame or dialog', async ({ page }) => {
  let dialogs = 0;
  page.on('dialog', async (dialog) => {
    dialogs += 1;
    await dialog.dismiss();
  });
  await page.goto(`/materials/${TOPIC}`);
  await page.getByRole('button', { name: 'Усі', exact: true }).click();
  const items = await page.getByTestId('material-item').all();
  test.skip(items.length === 0, 'No materials in this topic fixture');
  for (const item of items) {
    await item.click();
    await expect(page.getByTestId('material-reader')).toBeVisible();
    const main = page.locator('#main');
    await expect(main.locator('script, iframe, object, embed')).toHaveCount(0);
    await expect(main.locator('[onerror], [onload], [onclick], [onmouseover]')).toHaveCount(0);
    await expect(main.locator('a[href^="javascript:"], a[href^="http"]')).toHaveCount(0);
  }
  expect(dialogs).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __sllXss: number }).__sllXss)).toBe(0);
});

test('draft materials are labelled and their practice links are disabled', async ({ page }) => {
  await page.goto(`/materials/${TOPIC}`);
  await page.getByRole('button', { name: 'Потребують перевірки' }).click();
  const draft = page.getByTestId('material-item').first();
  test.skip((await draft.count()) === 0, 'No draft materials in this fixture');
  await draft.click();
  const reader = page.getByTestId('material-reader');
  await expect(reader).toContainText('Чернетка: ще не перевірено');
  for (const link of await reader.locator('.block-practice-link button').all()) await expect(link).toBeDisabled();
});

test('returning from materials keeps the current answer', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await openExercise(page, SHORT_TASK as string);
  const input = page.getByTestId('answer-input');
  await input.fill('respuesta guardada');
  await waitSaved(page);
  const exerciseUrl = new URL(page.url());
  await page.goto(`/materials/${TOPIC}?from=${encodeURIComponent(exerciseUrl.pathname + exerciseUrl.search)}`);
  await page.getByRole('link', { name: 'Повернутися до вправи' }).click();
  await expect(page.getByTestId('answer-input')).toHaveValue('respuesta guardada');
});
