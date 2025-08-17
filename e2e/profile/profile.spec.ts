import { expect } from '@playwright/test';

import { test } from '../auth/fixtures';

const START_PAGE = '/dashboard';

test.describe.configure({ mode: 'serial' });

const sel = {
  settingsButton: () => 'role=button[name="Profile settings"]',
  modalTitle: () => 'role=heading[name="Edit profile"]',
  nameInput: () => '#name',
  saveBtn: () => 'button:has-text("Save")',
  cancelBtn: () => 'button:has-text("Cancel")',
  snackbar: () => '[data-testid="snackbar-root"]',
};

const randomName = () => `E2E User ${Date.now()}`;

async function openProfileModal(page: any) {
  await page.goto(START_PAGE);

  const settings = page.getByRole('button', { name: 'Profile settings' });

  await expect(settings).toBeVisible({ timeout: 10_000 });
  await settings.click();

  await expect(page.getByRole('heading', { name: 'Edit profile' })).toBeVisible({ timeout: 10_000 });
}

async function closeProfileModal(page: any) {
  const cancel = page.locator(sel.cancelBtn());

  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click();
  }

  await expect(page.getByRole('heading', { name: 'Edit profile' })).toBeHidden({ timeout: 10_000 });
}

test.describe('Profile', () => {
  test.beforeEach(async ({ login }) => {
    await login();
  });

  test('Edit name → shows success toast and persists after reopening', async ({ page }) => {
    await openProfileModal(page);

    const newName = randomName();
    const nameInput = page.locator(sel.nameInput());

    await expect(nameInput).toBeVisible();
    await nameInput.fill('');
    await nameInput.type(newName);

    await page.click(sel.saveBtn());

    const successToast = page
      .getByTestId('snackbar-root')
      .filter({ hasText: /profile updated successfully/i })
      .first();

    await expect(successToast).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('heading', { name: 'Edit profile' })).toBeHidden({ timeout: 10_000 });

    await openProfileModal(page);
    await expect(page.locator(sel.nameInput())).toHaveValue(newName, { timeout: 10_000 });

    await closeProfileModal(page);
  });

  test('No changes → shows "No changes to update" toast and keeps modal open', async ({ page }) => {
    await openProfileModal(page);

    await page.click(sel.saveBtn());

    const noChangesToast = page
      .getByTestId('snackbar-root')
      .filter({ hasText: /no changes to update/i })
      .first();

    await expect(noChangesToast).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('heading', { name: 'Edit profile' })).toBeVisible({ timeout: 10_000 });

    await closeProfileModal(page);
  });
});
