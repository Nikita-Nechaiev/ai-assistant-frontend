import { createSession } from '../helpers';
import { test, expect } from '../auth/fixtures';

test.describe('Session documents (socket-driven list)', () => {
  test('Create → Rename → Delete on /session/:id', async ({ page, request, account, login }) => {
    const sessionId = await createSession(request, account);

    await login();
    await page.goto(`/session/${sessionId}`);
    await expect(page.getByRole('heading', { name: 'Session documents', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your next idea starts here.', exact: true })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);

    await page.getByRole('button', { name: 'New document', exact: true }).click();

    const createDialog = page.getByRole('dialog', { name: 'Create a document', exact: true });
    const initialTitle = 'E2E Project proposal';

    await createDialog.getByLabel('Document title', { exact: true }).fill(initialTitle);
    await createDialog.getByRole('button', { name: 'Create document', exact: true }).click();
    await expect(createDialog).toBeHidden();
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('link', { name: initialTitle, exact: true })).toBeVisible();

    const documentHref = await page.getByRole('link', { name: initialTitle, exact: true }).getAttribute('href');

    expect(documentHref).toMatch(new RegExp(`^/session/${sessionId}/document/\\d+$`));
    await page.getByRole('button', { name: `Actions for ${initialTitle}`, exact: true }).click();
    await page.getByRole('menuitem', { name: 'Rename', exact: true }).click();

    const renameDialog = page.getByRole('dialog', { name: 'Rename document', exact: true });
    const renamedTitle = 'E2E Updated proposal';

    await expect(renameDialog.getByLabel('Document title', { exact: true })).toHaveValue(initialTitle);
    await renameDialog.getByLabel('Document title', { exact: true }).fill(renamedTitle);
    await renameDialog.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(renameDialog).toBeHidden();
    await expect(page.getByRole('link', { name: renamedTitle, exact: true })).toHaveAttribute('href', documentHref!);
    await expect(page.getByRole('link', { name: initialTitle, exact: true })).toHaveCount(0);

    // Reload checks server persistence, rather than only the optimistic socket state.
    await page.reload();
    await expect(page.getByRole('link', { name: renamedTitle, exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Actions for ${renamedTitle}`, exact: true }).click();
    await page.getByRole('menuitem', { name: 'Rename', exact: true }).click();
    await expect(renameDialog.getByLabel('Document title', { exact: true })).toHaveValue(renamedTitle);
    await renameDialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    await page.getByRole('button', { name: `Actions for ${renamedTitle}`, exact: true }).click();
    await page.getByRole('menuitem', { name: 'Delete document', exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Your next idea starts here.', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your next idea starts here.', exact: true })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
  });
});
