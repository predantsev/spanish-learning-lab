// A-22: an unlisted free response stays unresolved inside the exercise — answer preserved, no
// pass/fail, reference shown as one example, edit & retry / skip / keep for review available.
import { expect, test } from '@playwright/test';
import { commandBody, fixture, openExercise, recordCommands, signIn, submitChord, useRealService, waitForCommand, waitSaved } from './ui-helpers.ts';

useRealService();

const RUBRIC_TASK = fixture('SLL_E2E_RUBRIC_TASK');

test.beforeEach(async ({ page }) => {
  test.skip(!RUBRIC_TASK, 'SLL_E2E_RUBRIC_TASK not set');
  await signIn(page);
});

test('free response unmatched to the exemplar is shown as unresolved with the answer kept', async ({ page }) => {
  await openExercise(page, RUBRIC_TASK as string);
  const input = page.getByTestId('answer-input');
  const answer = `Esta mañana he escrito una nota sintética ${Date.now().toString(36)}.`;
  await input.fill(answer);
  await waitSaved(page);
  const submitted = waitForCommand(page, 'attempt.submit');
  if ((await input.evaluate((element) => element.tagName)) === 'TEXTAREA') await input.press(submitChord);
  else await input.press('Enter');
  expect(commandBody(await submitted).payload['response']).toEqual({ text: answer });
  const panel = page.getByTestId('result-panel');
  await expect(panel).toHaveAttribute('data-unresolved', 'true', { timeout: 15_000 });
  await expect(panel.getByRole('heading', { name: 'Поки що не вдалося надійно оцінити' })).toBeVisible();
  await expect(panel).not.toContainText('Неправильно');
  await expect(input).toHaveValue(answer);
  await expect(panel.getByRole('button', { name: 'Редагувати й спробувати знову' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Зберегти для перевірки' })).toBeVisible();
  await expect(page.getByTestId('next-button')).toBeVisible();

  // The reference comes from GET /views/attempts/{id} after checking (no new support record) and is
  // shown only on request, labelled as one example when alternatives are possible.
  const reference = panel.getByRole('button', { name: 'Показати приклад відповіді' });
  if (await reference.count()) {
    const kinds = recordCommands(page);
    await reference.click();
    await expect(panel.getByTestId('reference-answer')).toBeVisible();
    await expect(panel.getByText(/Це приклад однієї можливої відповіді|Еталонна відповідь/)).toBeVisible();
    expect(kinds).not.toContain('support.request');
  }

  await panel.getByRole('button', { name: 'Зберегти для перевірки' }).click();
  await expect(panel.getByText('Ідентифікатор спроби')).toBeVisible();

  await panel.getByRole('button', { name: 'Редагувати й спробувати знову' }).click();
  await expect(input).not.toHaveAttribute('readonly', '');
  await expect(input).toHaveValue(answer);
});

test('skipping an unresolved answer moves on only on an explicit action', async ({ page }) => {
  await openExercise(page, RUBRIC_TASK as string);
  const url = page.url();
  await page.waitForTimeout(1500);
  expect(page.url()).toBe(url);
  await page.getByRole('button', { name: /Пропустити/ }).first().click();
  await expect(page).not.toHaveURL(url);
});

// A later validated adjudication (review.validate) is produced by the privileged local review CLI,
// not by the browser. The UI has no attempt-history screen in the first release, so the "receive a
// validated result later" observation of A-22 is verified at the API level by the integrator.
