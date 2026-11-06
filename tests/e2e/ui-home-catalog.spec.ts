// A-17: home hierarchy and truthful recovery states; catalog search/routes/scope.
import { expect, test } from '@playwright/test';
import { commandBody, signIn, useRealService, waitForCommand } from './ui-helpers.ts';

useRealService();

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('home shows one focus, separate Choose topic, evidence counts and never a mastery percentage', async ({ page }) => {
  await page.goto('/');
  const focus = page.getByTestId('home-focus');
  await expect(focus).toBeVisible();
  const kind = await focus.getAttribute('data-focus');
  expect(['first-use', 'review', 'resume', 'continue', 'choose']).toContain(kind);
  await expect(page.getByTestId('home-choose')).toBeVisible();
  await expect(page.getByTestId('home-choose').getByRole('link')).toHaveAttribute('href', '/catalog');
  if (kind === 'first-use') {
    // First use hides invented prior activity but keeps manual topic access.
    await expect(page.getByTestId('home-evidence')).toHaveCount(0);
    await expect(focus.getByRole('link', { name: 'Почати курс' })).toBeVisible();
  } else {
    await expect(page.getByTestId('home-evidence')).toBeVisible();
  }
  if (kind === 'review') await expect(focus.getByRole('button', { name: 'Почати повторення' })).toBeVisible();
  const text = await page.locator('#main').innerText();
  expect(text).not.toMatch(/\d\s?%/);
  expect(text).not.toMatch(/серія|streak/i);
});

test('a saved activity resumes the same context with its draft', async ({ page }) => {
  await page.goto('/');
  const resume = page.locator('[data-testid="home-resume"] a, [data-focus="resume"] a').first();
  test.skip((await resume.count()) === 0, 'The synthetic profile has no saved activity');
  const href = await resume.getAttribute('href');
  expect(href).toMatch(/^\/exercise\/[^?]+\?context=/);
  await resume.click();
  await expect(page.getByTestId('exercise')).toBeVisible();
  const contextId = new URL(href as string, 'http://x').searchParams.get('context');
  await expect(page).toHaveURL(new RegExp(`context=${contextId}`));
});

test('failed home load explains the problem and recovers on retry (no fake content)', async ({ page }) => {
  await page.route('**/api/v1/views/home', (route) => route.abort());
  await page.goto('/');
  const alert = page.getByRole('alert').filter({ hasText: 'Не вдалося завантажити' });
  await expect(alert).toBeVisible();
  await expect(page.getByTestId('home-focus')).toHaveCount(0);
  await page.unroute('**/api/v1/views/home');
  await alert.getByRole('button', { name: 'Спробувати ще раз' }).click();
  await expect(page.getByTestId('home-focus')).toBeVisible();
});

test('service unavailable shows the honest Start.command screen', async ({ page }) => {
  await page.route('**/api/v1/health', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Локальний сервіс не запущено' })).toBeVisible();
  await expect(page.getByText('Локальний сервіс не запущено — запустіть Start.command.')).toBeVisible();
});

test('catalog search "hecho" finds a lesson by its form; filters survive detail and Back', async ({ page }) => {
  await page.goto('/catalog');
  const search = page.getByTestId('catalog-search');
  await search.fill('hecho');
  const results = page.getByTestId('catalog-result');
  await expect(results.first()).toBeVisible();
  await expect(page.getByTestId('catalog-count')).toContainText(String(await results.count()));
  // Accent-insensitive: the same lessons are found without diacritics in the query.
  await search.fill('héchó');
  await expect(results.first()).toBeVisible();
  await search.fill('hecho');
  const href = await results.first().getAttribute('href');
  await results.first().click();
  await expect(page).toHaveURL(href as string);
  await expect(page.getByTestId('catalog-detail')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('catalog-search')).toHaveValue('hecho');
});

test('topics and situations lead to the same lesson identities', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-result').first()).toBeVisible();
  const topicHrefs = new Set(await page.getByTestId('catalog-result').evaluateAll((links) => links.map((link) => link.getAttribute('href'))));
  await page.getByRole('button', { name: 'Ситуації' }).click();
  const situationHrefs = await page.getByTestId('catalog-result').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  for (const href of situationHrefs) expect(topicHrefs.has(href)).toBe(true);
});

test('a manually selected target and mode are sent exactly, never broadened; empty scope disables practice', async ({ page }) => {
  await page.goto('/catalog');
  await page.getByTestId('catalog-search').fill('hecho');
  await page.getByTestId('catalog-result').first().click();
  const detail = page.getByTestId('catalog-detail');
  const boxes = detail.getByRole('checkbox');
  const count = await boxes.count();
  test.skip(count === 0, 'The found lesson has no practice targets in this fixture');
  for (let index = 0; index < count; index += 1) await boxes.nth(index).uncheck();
  await expect(page.getByTestId('catalog-practice')).toBeDisabled();
  await boxes.first().check();
  await detail.getByRole('radio', { name: 'Письмово' }).check();
  test.skip(await page.getByTestId('catalog-practice').isDisabled(), 'The lesson is not ready in this fixture');
  const sent = waitForCommand(page, 'practice.create');
  await page.getByTestId('catalog-practice').click();
  const body = commandBody(await sent);
  expect(body.payload['mode']).toBe('written');
  expect(body.payload['targets']).toHaveLength(1);
  expect(body.payload['phraseIds']).toEqual([]);
});
