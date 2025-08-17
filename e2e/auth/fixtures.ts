/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';

interface AuthFixtures {
  login: () => Promise<void>;
}

export const test = base.extend<AuthFixtures>({
  login: async ({ page }, use) => {
    const loginFn = async () => {
      await page.goto('/login');
      await page.fill('input#email', process.env.E2E_EMAIL!);
      await page.fill('input#password', process.env.E2E_PASSWORD!);
      await page.click('button[type="submit"]');

      await page.waitForURL('/dashboard');
      await page.context().storageState({ path: 'e2e/.auth/user.json' });
    };

    await use(loginFn);
  },
});

export { expect };
