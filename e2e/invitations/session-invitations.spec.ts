import { createAccount, createSession, uniqueEmail } from '../helpers';
import { test, expect } from '../auth/fixtures';

test.describe('Session invitations', () => {
  test('Invite flow: send → modal closes → appears in list; duplicate & not-found show toasts', async ({
    page,
    request,
    account,
    login,
  }) => {
    const invitee = await createAccount(request);
    const sessionId = await createSession(request, account);

    await login();
    await page.goto(`/session/${sessionId}`);
    await expect(page.getByRole('heading', { name: 'Session documents', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Invite collaborators', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Better work starts together.', exact: true });
    const email = dialog.getByLabel('Collaborator email', { exact: true });
    const role = dialog.getByLabel('Access level', { exact: true });
    const send = dialog.getByRole('button', { name: 'Send invitation', exact: true });
    const snackbar = page.getByTestId('snackbar-root');

    await email.fill(invitee.email);
    await role.selectOption({ label: 'Editor — can create and edit' });
    await send.click();
    await expect(snackbar).toContainText(`Invitation has been sent to ${invitee.email}`);
    await expect(dialog).toBeHidden();
    await snackbar.getByRole('button', { name: 'Dismiss notification', exact: true }).click();

    await page.reload();
    await page.getByRole('button', { name: 'Invite collaborators', exact: true }).click();
    await expect(dialog.getByRole('heading', { name: 'Existing invitations', exact: true })).toBeVisible();
    await expect(dialog.getByText(invitee.email, { exact: true })).toBeVisible();
    await expect(dialog.getByText('Editor', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Manage invitation', exact: true })).toHaveCount(1);

    await email.fill(invitee.email);
    await role.selectOption({ label: 'Editor — can create and edit' });
    await send.click();
    await expect(snackbar).toContainText(`User with email ${invitee.email} already has an invitation for this session`);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Manage invitation', exact: true })).toHaveCount(1);

    const missingEmail = uniqueEmail('missing');

    await email.fill(missingEmail);
    await role.selectOption({ label: 'Viewer — can read documents' });
    await send.click();
    await expect(snackbar).toContainText(`User with email ${missingEmail} not found`);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(missingEmail, { exact: true })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Manage invitation', exact: true })).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
