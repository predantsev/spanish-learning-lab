// Shared helpers for the browser UI specs (A-17…A-23). These specs run only against a REAL local
// service started by the integrator; they never mock the API. Fault injection is limited to
// aborting requests (network failure), never fulfilling them with fabricated data.
//
// Environment:
//   SLL_E2E_URL            origin of the running service, e.g. http://spanish-learning-lab.localhost:PORT
//   one of (authentication):
//   SLL_E2E_STORAGE_STATE  Playwright storage-state file holding a valid owner session cookie
//   SLL_E2E_NONCE_CMD      shell command printing a fresh one-use launcher nonce (43 chars)
//   SLL_E2E_NONCE_URL      full URL with a fresh `#n=<nonce>` fragment (single use)
//   fixtures (synthetic profile, ACCEPTANCE.md): SLL_E2E_SHORT_TASK, SLL_E2E_MULTILINE_TASK,
//   SLL_E2E_LISTENING_TASK, SLL_E2E_RUBRIC_TASK (ready task revision ids), SLL_E2E_TOPIC (materials topic)
import { execSync } from 'node:child_process';
import { expect, test, type Page, type Request } from '@playwright/test';

export const E2E_URL = process.env['SLL_E2E_URL'];
const STORAGE_STATE = process.env['SLL_E2E_STORAGE_STATE'];
const NONCE_CMD = process.env['SLL_E2E_NONCE_CMD'];
const NONCE_URL = process.env['SLL_E2E_NONCE_URL'];

/** Call at the top of every spec file. */
export function useRealService(): void {
  test.skip(!E2E_URL, 'SLL_E2E_URL is not set: these specs run against a real local service only');
  test.use({ baseURL: E2E_URL, ...(STORAGE_STATE ? { storageState: STORAGE_STATE } : {}) });
}

export function fixture(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

/** Establishes the owner session (cookie) the way the launcher does: one-use nonce in the fragment. */
export async function signIn(page: Page): Promise<void> {
  if (STORAGE_STATE) return;
  let url = NONCE_URL;
  if (NONCE_CMD) {
    const nonce = execSync(NONCE_CMD, { encoding: 'utf8' }).trim();
    url = `${E2E_URL}/#n=${nonce}`;
  }
  test.skip(!url, 'No authentication configured: set SLL_E2E_STORAGE_STATE, SLL_E2E_NONCE_CMD or SLL_E2E_NONCE_URL');
  await page.goto(url as string);
  // The UI removes the fragment immediately (API.md) and reaches the authenticated shell.
  await expect(page).not.toHaveURL(/#n=/);
  await expect(page.locator('nav.sidebar, nav.bottom-nav').first()).toBeAttached();
}

export function isCommand(request: Request, kind?: string): boolean {
  if (request.method() !== 'POST' || !request.url().endsWith('/api/v1/commands')) return false;
  if (!kind) return true;
  try {
    return (JSON.parse(request.postData() ?? '{}') as { kind?: string }).kind === kind;
  } catch {
    return false;
  }
}

export function commandBody(request: Request): {
  kind: string;
  operationId: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
} {
  return JSON.parse(request.postData() ?? '{}');
}

export function waitForCommand(page: Page, kind: string, timeout = 10_000): Promise<Request> {
  return page.waitForRequest((request) => isCommand(request, kind), { timeout });
}

/** Records every command kind sent by the page (to assert that something was NOT sent). */
export function recordCommands(page: Page): string[] {
  const kinds: string[] = [];
  page.on('request', (request) => {
    if (isCommand(request)) kinds.push(commandBody(request).kind);
  });
  return kinds;
}

export const submitChord = process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter';

export async function openExercise(page: Page, taskRevisionId: string): Promise<void> {
  await page.goto(`/exercise/${encodeURIComponent(taskRevisionId)}`);
  await expect(page.getByTestId('exercise')).toBeVisible({ timeout: 15_000 });
  // The context id is written to the URL so a reload resumes the same context.
  await expect(page).toHaveURL(/[?&]context=/);
}

/** Waits until the draft pill says the text was acknowledged by the service. */
export async function waitSaved(page: Page): Promise<void> {
  await expect(page.locator('.save-pill [role="status"]')).toHaveText(/Збережено/, { timeout: 10_000 });
}
