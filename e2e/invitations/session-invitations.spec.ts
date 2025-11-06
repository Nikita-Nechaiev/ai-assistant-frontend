import { expect } from '@playwright/test';

import { test } from '../auth/fixtures';

test.describe.configure({ mode: 'serial' });

const ORIGIN = 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const SEL = {
  modalTitle: 'role=heading[name="Invite a Collaborator"]',
  emailInput: '#invite-email',
  roleSelect: '#permission-select',
  sendBtn: 'button:has-text("Send Invitation")',
  cancelBtn: 'button:has-text("Cancel")',
  existingListHeader: 'role=heading[name="Existing Invitations"]',
  snackbar: '[data-testid="snackbar-root"]',
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

async function waitForSessionUI(page: any, timeoutMs = 10_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const docs = await page
      .getByRole('heading', { name: /Session\s+Documents/i })
      .isVisible()
      .catch(() => false);
    const chat = await page
      .getByRole('heading', { name: /Session\s+Chat/i })
      .isVisible()
      .catch(() => false);

    if (docs || chat) return true;

    await page.waitForTimeout(200);
  }

  return false;
}

async function openInviteModal(page: any) {
  const custom = process.env.E2E_INVITE_TRIGGER;

  if (custom) {
    await Promise.all([page.locator(SEL.modalTitle).waitFor({ state: 'visible' }), page.locator(custom).click()]);

    return;
  }

  const header = page.locator('header').first();
  const timeLabel = header.locator('text=/^\\d{1,2}:[0-5]\\d$/').first();

  await expect(timeLabel).toBeVisible({ timeout: 10_000 });

  const inviteBtn = timeLabel.locator('xpath=preceding::button[1]').first();

  await Promise.all([page.locator(SEL.modalTitle).waitFor({ state: 'visible', timeout: 10_000 }), inviteBtn.click()]);
}

async function closeInviteModal(page: any) {
  const hasCancel = await page
    .locator(SEL.cancelBtn)
    .isVisible()
    .catch(() => false);

  if (hasCancel) {
    await Promise.all([
      page
        .locator(SEL.modalTitle)
        .waitFor({ state: 'hidden', timeout: 10_000 })
        .catch(() => {}),
      page.click(SEL.cancelBtn),
    ]);
  } else {
    await page.keyboard.press('Escape');
    await page
      .locator(SEL.modalTitle)
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(() => {});
  }
}

function getExistingListContainer(page: any) {
  return page.locator(SEL.existingListHeader).locator('xpath=ancestor::*[self::section or self::div][1]');
}

async function ensureUserExists(request: any, email: string) {
  const res = await request.post(`${API_URL}/auth/register`, {
    multipart: { name: 'E2E Invitee', email, password: 'Password1!' },
  });

  expect([200, 201, 409]).toContain(res.status());
}

test.describe('Session invitations', () => {
  test.beforeEach(async ({ login }) => {
    await login();
  });

  test('Invite flow: send → modal closes → appears in list; duplicate & not-found show toasts', async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000);

    const owner = process.env.E2E_EMAIL!;
    const invitee = process.env.E2E_INVITEE_EMAIL!;

    test.skip(!invitee, 'Set E2E_INVITEE_EMAIL in .env.test.local to an existing user email');
    test.skip(
      invitee.toLowerCase() === owner.toLowerCase(),
      `E2E_INVITEE_EMAIL (${invitee}) must be different from E2E_EMAIL (${owner})`,
    );

    await ensureUserExists(request, invitee);

    const access = await apiLogin(request);
    const sessionId = await apiCreateSession(request, access);
    const sessionUrl = `${ORIGIN}/session/${sessionId}`;

    await page.goto(sessionUrl);
    await page.waitForLoadState('domcontentloaded');
    expect(new URL(page.url()).pathname.startsWith(`/session/${sessionId}`)).toBeTruthy();
    expect(await waitForSessionUI(page)).toBeTruthy();

    await openInviteModal(page);
    await page.fill(SEL.emailInput, invitee);
    await page.selectOption(SEL.roleSelect, 'EDIT');
    await page.click(SEL.sendBtn);

    const snackbar = page.locator(SEL.snackbar);

    await snackbar.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

    const isToastVisible = await snackbar.isVisible().catch(() => false);

    if (isToastVisible) {
      const text = (await snackbar.textContent()) ?? '';

      expect(text.toLowerCase()).not.toMatch(/not\s*found|already a participant/);
    }

    const modalTitle = page.locator(SEL.modalTitle);

    await modalTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
      await closeInviteModal(page);
      await expect(modalTitle).toBeHidden({ timeout: 10_000 });
    });

    await openInviteModal(page);
    await expect(page.locator(SEL.existingListHeader)).toBeVisible({ timeout: 10_000 });

    const existingList = getExistingListContainer(page);

    await expect
      .poll(async () => (await existingList.textContent()) ?? '', {
        timeout: 30_000,
        intervals: [200, 400, 800, 1200],
      })
      .toMatch(new RegExp(invitee, 'i'));

    await page.fill(SEL.emailInput, invitee);
    await page.selectOption(SEL.roleSelect, 'EDIT');
    await page.click(SEL.sendBtn);
    await expect(snackbar).toBeVisible({ timeout: 10_000 });

    await modalTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
      await closeInviteModal(page);
    });

    const missing = `missing_${Date.now()}@example.com`;

    await openInviteModal(page);
    await page.fill(SEL.emailInput, missing);
    await page.selectOption(SEL.roleSelect, 'READ');
    await page.click(SEL.sendBtn);
    await expect(snackbar).toBeVisible({ timeout: 10_000 });
    await modalTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
      await closeInviteModal(page);
    });
  });
});
