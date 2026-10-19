/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';

import { createAccount, expectDashboard, TestAccount } from '../helpers';

interface AuthFixtures {
  account: TestAccount;
  login: () => Promise<void>;
}

export const test = base.extend<AuthFixtures>({
  account: async ({ request }, use) => {
    await use(await createAccount(request));
  },
  login: async ({ page, account }, use) => {
    await use(async () => {
      await page.goto('/login');
      await page.getByLabel('Email address', { exact: true }).fill(account.email);
      await page.getByLabel('Password', { exact: true }).fill(account.password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expectDashboard(page);
    });
  },
});

export { expect };
