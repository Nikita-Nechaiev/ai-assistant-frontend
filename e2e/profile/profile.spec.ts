import { test, expect } from '../auth/fixtures';

test.describe('Profile', () => {
  test.beforeEach(async ({ login, page }) => {
    await login();
    await page.getByRole('button', { name: 'Profile settings', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Profile settings', exact: true })).toBeVisible();
  });

  test('Edit name → shows success toast and persists after reopening', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Profile settings', exact: true });
    const newName = 'E2E Updated User';

    await dialog.getByLabel('Display name', { exact: true }).fill(newName);
    await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByTestId('snackbar-root')).toContainText('Profile updated successfully');
    await expect(dialog).toBeHidden();

    // Reopen after reloading so a stale client store cannot hide a failed save.
    await page.reload();
    await page.getByRole('button', { name: 'Profile settings', exact: true }).click();
    await expect(dialog.getByLabel('Display name', { exact: true })).toHaveValue(newName);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden();
  });

  test('No changes → shows "No changes to update" toast and keeps modal open', async ({ page, account }) => {
    const dialog = page.getByRole('dialog', { name: 'Profile settings', exact: true });

    await expect(dialog.getByLabel('Display name', { exact: true })).toHaveValue(account.name);
    await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByTestId('snackbar-root')).toContainText('No changes to update');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Display name', { exact: true })).toHaveValue(account.name);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
