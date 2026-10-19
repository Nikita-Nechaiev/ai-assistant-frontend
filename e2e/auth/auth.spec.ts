import { expectDashboard } from '../helpers';
import { test, expect } from './fixtures';

test.describe('Auth flow', () => {
  test('Success login redirects to dashboard', async ({ page, account, login }) => {
    await login();
    await expectDashboard(page);
    await expect(page.getByText(account.email, { exact: true })).toBeVisible();

    const cookies = await page.context().cookies();

    expect(cookies.map(({ name }) => name)).toEqual(expect.arrayContaining(['accessToken', 'refreshToken']));
  });

  test('Wrong password shows error toast', async ({ page, account }) => {
    await page.goto('/login');
    await page.getByLabel('Email address', { exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill('Wrong123!');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().endsWith('/auth/login') && res.request().method() === 'POST'),
      page.getByRole('button', { name: 'Sign in', exact: true }).click(),
    ]);

    expect(response.status()).toBe(401);
    await expect(page.getByTestId('snackbar-root')).toContainText('Invalid email or password!');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  });

  test('Redirects to /dashboard when accessToken already present', async ({ browser, page, login }) => {
    await login();

    const context = await browser.newContext({ storageState: await page.context().storageState() });

    try {
      const authenticatedPage = await context.newPage();

      await authenticatedPage.goto('/login');
      await expectDashboard(authenticatedPage);
    } finally {
      await context.close();
    }
  });
});
