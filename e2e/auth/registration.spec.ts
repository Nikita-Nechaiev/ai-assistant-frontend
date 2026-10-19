import { test, expect } from '@playwright/test';

import { API_URL, createAccount, expectDashboard, uniqueEmail } from '../helpers';

test('New user can register and reach dashboard', async ({ page }) => {
  const email = uniqueEmail('registration');

  await page.goto('/registration');
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password');
  await page.locator('#name').fill('E2E User');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Password1!');
  await page.locator('#confirmPassword').fill('Password1!');

  const submit = page.getByRole('button', { name: 'Create account', exact: true });

  await expect(submit).toBeEnabled();

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url() === `${API_URL}/auth/register` && res.request().method() === 'POST'),
    submit.click(),
  ]);

  expect(response.status()).toBe(201);
  expect((await response.json()).user).toMatchObject({ email, name: 'E2E User' });
  await expectDashboard(page);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});

test('Duplicate e-mail shows “already exists” error', async ({ page, request }) => {
  const account = await createAccount(request);

  await page.goto('/registration');
  await page.locator('#name').fill(account.name);
  await page.locator('#email').fill(account.email);
  await page.locator('#password').fill(account.password);
  await page.locator('#confirmPassword').fill(account.password);

  const submit = page.getByRole('button', { name: 'Create account', exact: true });
  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url() === `${API_URL}/auth/register` && res.request().method() === 'POST'),
    submit.click(),
  ]);

  expect(response.status()).toBe(409);
  expect((await response.json()).message).toBe('User with this email already exists');
  await expect(page).toHaveURL(/\/registration$/);
  await expect(page.getByTestId('snackbar-root')).toContainText('User with this email already exists!');
  await expect(submit).toBeEnabled();
});
