import { expect } from '@playwright/test';

import { test } from '../auth/fixtures';

test.describe.configure({ mode: 'serial' });

const ORIGIN = 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const sel = {
  titleInput: '#documentTitle',
  createBtn: 'button:has-text("Create")',
  saveBtn: 'button:has-text("Save")',

  emptyStateHeading: 'role=heading[name="No documents found"]',
  docLinksInSession: (sessionId: string) => `a[href^="/session/${sessionId}/document/"]`,
};

const uniq = (p: string) => `${p}-${Date.now().toString().slice(-6)}`;

async function apiLogin(request: any): Promise<string> {
  const resp = await request.post(`${API_URL}/auth/login`, {
    data: { email: process.env.E2E_EMAIL!, password: process.env.E2E_PASSWORD! },
  });

  expect([200, 201]).toContain(resp.status());

  const body = await resp.json();

  return body.accessToken as string;
}

async function apiCreateSession(request: any, accessToken: string): Promise<string> {
  const resp = await request.post(`${API_URL}/collaboration-session/create`, {
    data: { name: uniq('E2E Session') },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect([200, 201]).toContain(resp.status());

  const json = await resp.json();
  const id = json.id ?? json.session?.id ?? json.data?.id;

  expect(id, 'Session id not found in API response').toBeTruthy();

  return String(id);
}

async function waitForSessionUI(page: any, sessionId: string, timeoutMs = 10_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const empty = await page
      .getByRole('heading', { name: /No documents found/i })
      .isVisible()
      .catch(() => false);
    const anyDocLink = await page
      .locator(sel.docLinksInSession(sessionId))
      .first()
      .isVisible()
      .catch(() => false);

    if (empty || anyDocLink) return true;

    await page.waitForTimeout(200);
  }

  return false;
}

function documentsSection(page: any) {
  return page
    .getByRole('heading', { name: /Session\s+Documents/i })
    .locator('xpath=ancestor::*[self::section or self::div][1]');
}

test.describe('Session documents (socket-driven list)', () => {
  test.beforeEach(async ({ login }) => {
    await login();
  });

  test('Create → Rename → Delete on /session/:id', async ({ page, request }) => {
    const access = await apiLogin(request);
    const sessionId = await apiCreateSession(request, access);
    const sessionUrl = `${ORIGIN}/session/${sessionId}`;

    await page.goto(sessionUrl);
    await page.waitForLoadState('domcontentloaded');
    expect(new URL(page.url()).pathname.startsWith(`/session/${sessionId}`)).toBeTruthy();

    const isReady = await waitForSessionUI(page, sessionId);

    expect(isReady).toBeTruthy();

    const docLinks = page.locator(sel.docLinksInSession(sessionId));
    const countBefore = await docLinks.count();

    const section = documentsSection(page);
    const createTile = section.locator('button:has(svg)').first();

    await expect(createTile).toBeVisible({ timeout: 10_000 });

    const initialTitle = uniq('E2E Doc');

    await Promise.all([
      page.locator(sel.titleInput).waitFor({ state: 'visible', timeout: 10_000 }),
      createTile.click(),
    ]);

    await page.locator(sel.titleInput).fill(initialTitle);
    await page.click(sel.createBtn);

    await page.locator(sel.titleInput).waitFor({ state: 'hidden', timeout: 10_000 });
    await expect(docLinks).toHaveCount(countBefore + 1, { timeout: 20_000 });

    const newestLink = docLinks.first();
    const href = await newestLink.getAttribute('href');

    expect(href, 'Newly created document link not found').toBeTruthy();

    const card = page.locator('div', { has: newestLink }).first();
    const ellipsis = card.locator('button:has(svg.w-5.h-5)').first();

    await ellipsis.click();
    await page.getByText('Rename', { exact: true }).click();

    await page.locator(sel.titleInput).waitFor({ state: 'visible', timeout: 10_000 });

    const renamedTitle = uniq('E2E Renamed');

    await page.locator(sel.titleInput).fill(renamedTitle);
    await page.click(sel.saveBtn);

    await page.locator(sel.titleInput).waitFor({ state: 'hidden', timeout: 10_000 });

    await ellipsis.click();
    await page.getByText('Rename', { exact: true }).click();
    await expect(page.locator(sel.titleInput)).toHaveValue(renamedTitle, { timeout: 10_000 });

    await page.click(sel.saveBtn);
    await page.locator(sel.titleInput).waitFor({ state: 'hidden', timeout: 10_000 });

    const countBeforeDelete = await docLinks.count();

    await ellipsis.click();
    await page.getByText('Delete', { exact: true }).click();

    await expect(docLinks).toHaveCount(countBeforeDelete - 1, { timeout: 20_000 });
  });
});
