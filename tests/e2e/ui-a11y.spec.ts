// A-23: keyboard-only use, labels/live status, 200% zoom and 320/375/390/768/1440 px widths without
// horizontal clipping, ≥44 px touch targets, visible focus, system dark, reduced motion, sheets that
// close and restore focus, no hover-only help, no colour-only verdict.
import { expect, test, type Page } from '@playwright/test';
import { fixture, openExercise, signIn, useRealService } from './ui-helpers.ts';

useRealService();

const SHORT_TASK = fixture('SLL_E2E_SHORT_TASK');
const ROUTES = ['/', '/catalog', '/review', '/listening', '/phrases', '/progress', '/settings', '/settings/agents', '/settings/recovery'];

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

async function noHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const width of [320, 375, 390, 768, 1440]) {
  test(`no horizontal clipping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('#page-title, h1').first()).toBeVisible();
      await noHorizontalOverflow(page);
    }
  });
}

test('200% zoom equivalent (640 px CSS viewport) keeps every screen usable without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 450 });
  for (const route of ROUTES) {
    await page.goto(route);
    await noHorizontalOverflow(page);
  }
});

test('interactive controls are at least 44×44 px', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/catalog', '/phrases', '/progress', '/settings']) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      const small = await page.locator('.btn:visible, .nav-link:visible, .help-button:visible, .choice:visible').evaluateAll((elements) =>
        elements
          .map((element) => element.getBoundingClientRect())
          .filter((box) => box.width > 0 && (box.height < 43.5 || box.width < 43.5))
          .map((box) => `${Math.round(box.width)}x${Math.round(box.height)}`),
      );
      expect(small, `${route} @${width}`).toEqual([]);
    }
  }
});

test('keyboard: skip link first, visible focus ring, navigation reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Перейти до основного вмісту' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    return active ? getComputedStyle(active).outlineStyle : 'none';
  });
  expect(outline).not.toBe('none');
  await page.getByRole('navigation').first().getByRole('link', { name: 'Курс' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.locator('#page-title')).toBeFocused();
});

test('system dark scheme is respected when the theme follows the system', async ({ page }) => {
  await page.goto('/');
  const explicit = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  test.skip(explicit !== null, 'The profile pins an explicit theme');
  await page.emulateMedia({ colorScheme: 'light' });
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
});

test('reduced motion stops animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/v1/views/progress', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto('/progress');
  const spinner = page.locator('.spinner').first();
  await expect(spinner).toBeVisible();
  expect(await spinner.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
});

test('help opens by click/keyboard only and closes with Escape back to its button', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.help-button').first();
  await button.hover();
  await expect(page.locator('.help-panel:visible')).toHaveCount(0);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.help-panel:visible').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
});

test('phone reference sheet closes with Escape and restores focus; save status is a live region', async ({ page }) => {
  test.skip(!SHORT_TASK, 'SLL_E2E_SHORT_TASK not set');
  await page.setViewportSize({ width: 390, height: 844 });
  await openExercise(page, SHORT_TASK as string);
  await expect(page.locator('.save-pill [role="status"]')).toHaveAttribute('aria-live', 'polite');
  const toggle = page.getByTestId('reference-toggle');
  await toggle.click();
  const sheet = page.locator('dialog[open]');
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(toggle).toBeFocused();
});
