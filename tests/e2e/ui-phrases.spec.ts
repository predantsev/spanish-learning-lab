// A-19: three add paths, one phrase in several collections, course collection copy by reference,
// practice of an explicitly selected ready subset; drafts are labelled and never practice keys.
import { expect, test, type Page } from '@playwright/test';
import { commandBody, signIn, useRealService, waitForCommand } from './ui-helpers.ts';

useRealService();

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await page.goto('/phrases');
  await expect(page.locator('#library-title')).toBeVisible();
});

async function addPhrase(page: Page, path: 'Іспанська фраза' | 'Український намір', text: string, meaning: string) {
  await page.getByTestId('add-phrase').click();
  const dialog = page.locator('dialog[open]');
  await dialog.getByRole('radio', { name: new RegExp(path) }).check();
  await dialog.locator('input[type="text"]').first().fill(text);
  await dialog.locator('input[type="text"]').nth(1).fill(meaning);
  const sent = waitForCommand(page, 'phrase.capture');
  await page.getByRole('button', { name: 'Зберегти' }).click();
  return commandBody(await sent);
}

test('Spanish phrase and Ukrainian intent are captured as drafts and labelled as non-models', async ({ page }) => {
  const stamp = Date.now().toString(36);
  const spanish = await addPhrase(page, 'Іспанська фраза', `Synthetic frase ${stamp}`, 'синтетичне значення');
  expect(spanish.payload).toEqual({ source: 'spanish', text: `Synthetic frase ${stamp}`, meaning: 'синтетичне значення' });
  await page.keyboard.press('Escape');
  const intent = await addPhrase(page, 'Український намір', `Синтетичний намір ${stamp}`, '');
  expect(intent.payload['source']).toBe('uk-intent');
  await page.keyboard.press('Escape');
  await page.getByLabel('Пошук іспанською чи українською').fill(stamp);
  const rows = page.getByTestId('phrase-row');
  await expect(rows).toHaveCount(2);
  for (const row of await rows.all()) {
    await expect(row).toContainText('чернетка — не використовується як зразок відповіді');
    await expect(row.getByRole('checkbox')).toBeDisabled();
  }
});

test('a course phrase is captured by reference to its reviewed revision', async ({ page }) => {
  await page.getByTestId('add-phrase').click();
  const dialog = page.locator('dialog[open]');
  await dialog.getByRole('radio', { name: /З курсу/ }).check();
  const course = dialog.locator('input[type="radio"][name$="-course"]');
  test.skip((await course.count()) === 0, 'No ready course phrases in this fixture');
  await course.first().check();
  const sent = waitForCommand(page, 'phrase.capture');
  await page.getByRole('button', { name: 'Зберегти' }).click();
  const body = commandBody(await sent);
  expect(body.payload['source']).toBe('course');
  expect(typeof body.payload['sourceRevisionId']).toBe('string');
});

test('one phrase in three personal collections shares one record; removal can be undone', async ({ page }) => {
  const stamp = Date.now().toString(36);
  for (let index = 1; index <= 3; index += 1) {
    await page.getByRole('button', { name: 'Створити добірку' }).click();
    await page.getByLabel('Назва добірки').fill(`Synthetic ${stamp} ${index}`);
    const created = waitForCommand(page, 'collection.create');
    await page.getByRole('button', { name: 'Створити', exact: true }).click();
    expect(commandBody(await created).payload['phraseIds']).toEqual([]);
  }
  const firstPhrase = page.getByTestId('phrase-row').first().getByRole('link');
  test.skip((await firstPhrase.count()) === 0, 'The library is empty in this fixture');
  await firstPhrase.click();
  const detail = page.getByTestId('phrase-detail');
  for (let index = 1; index <= 3; index += 1) {
    const patched = waitForCommand(page, 'collection.patch');
    await detail.getByRole('checkbox', { name: `Synthetic ${stamp} ${index}` }).check();
    const body = commandBody(await patched);
    expect((body.payload['add'] as string[]).length).toBe(1);
    expect(body.payload['remove']).toEqual([]);
  }
  for (let index = 1; index <= 3; index += 1) {
    await expect(detail.getByRole('checkbox', { name: `Synthetic ${stamp} ${index}` })).toBeChecked();
  }
  const removed = waitForCommand(page, 'collection.patch');
  await detail.getByRole('checkbox', { name: `Synthetic ${stamp} 1` }).uncheck();
  expect((commandBody(await removed).payload['remove'] as string[]).length).toBe(1);
  const undone = waitForCommand(page, 'collection.patch');
  await page.getByRole('button', { name: 'Повернути' }).click();
  expect((commandBody(await undone).payload['add'] as string[]).length).toBe(1);
});

test('copying a course collection creates a personal collection with the same phrase references', async ({ page }) => {
  const course = page.locator('[aria-labelledby="collections-title"] h3:has-text("Добірки курсу") + ul [data-testid="collection-item"]').first();
  test.skip((await course.count()) === 0, 'No course collections in this fixture');
  await course.click();
  const memberCount = await page.locator('.result-list .result-item').count();
  const created = waitForCommand(page, 'collection.create');
  await page.getByTestId('copy-collection').click();
  const body = commandBody(await created);
  expect((body.payload['phraseIds'] as string[]).length).toBe(memberCount);
  await expect(page).toHaveURL(/\/collections\//);
});

test('archiving a phrase asks first and can be undone (phrase.archive true → false)', async ({ page }) => {
  const stamp = Date.now().toString(36);
  await addPhrase(page, 'Іспанська фраза', `Synthetic archivo ${stamp}`, '');
  await page.keyboard.press('Escape');
  await page.getByLabel('Пошук іспанською чи українською').fill(stamp);
  await page.getByTestId('phrase-row').first().getByRole('link').click();
  const detail = page.getByTestId('phrase-detail');
  await detail.getByTestId('archive-phrase').click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toContainText('Архівувати фразу?');
  const archived = waitForCommand(page, 'phrase.archive');
  await dialog.getByRole('button', { name: 'Архівувати фразу', exact: true }).click();
  expect(commandBody(await archived).payload).toEqual({ archived: true });
  const restored = waitForCommand(page, 'phrase.archive');
  await page.getByRole('button', { name: 'Повернути' }).click();
  expect(commandBody(await restored).payload).toEqual({ archived: false });
});

test('practice uses exactly the selected ready phrases and their phrase-recall targets', async ({ page }) => {
  const ready = page.getByTestId('phrase-row').locator('input[type="checkbox"]:not([disabled])');
  test.skip((await ready.count()) < 2, 'Fewer than two ready phrases in this fixture');
  await page.getByRole('button', { name: 'Зняти вибір' }).first().click();
  await ready.nth(0).check();
  await ready.nth(1).check();
  const sent = waitForCommand(page, 'practice.create');
  await page.getByTestId('practice-phrases').click();
  const body = commandBody(await sent);
  expect((body.payload['phraseIds'] as string[]).length).toBe(2);
  expect(body.payload['mode']).toBe('written');
  const targets = body.payload['targets'] as { modality: string }[];
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) expect(target.modality).toBe('phrase-recall');
});
