import { test, expect } from './fixtures';

test.describe('Auth flow', () => {
  test('Success login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', process.env.E2E_EMAIL!);
    await page.fill('#password', process.env.E2E_PASSWORD!);

    await Promise.all([page.waitForURL('**/dashboard', { timeout: 15_000 }), page.click('button[type="submit"]')]);

    await expect(page.getByRole('heading', { name: 'Sessions', level: 1 })).toBeVisible();
  });

  test('Wrong password shows error toast', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', process.env.E2E_EMAIL!);
    await page.fill('#password', 'Wrong123!');

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/auth/login') && r.status() === 401),
      page.click('button[type="submit"]'),
    ]);

    await expect(page.getByText(/invalid email or password!/i)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Redirects to /dashboard when accessToken already present', async ({ browser, login }) => {
    await login();

    const ctx = await browser.newContext({ storageState: 'e2e/.auth/user.json' });
    const p = await ctx.newPage();

    await p.goto('/login');
    await p.waitForURL('**/dashboard', { timeout: 15_000 });
    await expect(p.getByRole('heading', { name: 'Sessions', level: 1 })).toBeVisible();

    await ctx.close();
  });
});
