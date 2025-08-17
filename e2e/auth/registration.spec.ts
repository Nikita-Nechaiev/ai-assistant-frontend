import { test, expect } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function randomEmail() {
  return `e2e_${Date.now()}@example.com`;
}

test('New user can register and reach dashboard', async ({ page }) => {
  await page.goto('/registration');

  await page.fill('#name', 'E2E User');
  await page.fill('#email', randomEmail());
  await page.fill('#password', 'Password1!');
  await page.fill('#confirmPassword', 'Password1!');

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/auth/register') && [200, 201].includes(r.status())),
    page.click('button[type="submit"]'),
  ]);

  await page.waitForURL('**/dashboard', { timeout: 15000 });

  await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible();
});

test('Duplicate e-mail shows “already exists” error', async ({ page, request }) => {
  const dupEmail = `dup_${Date.now()}@example.com`;
  const seed = await request.post(`${API_URL}/auth/register`, {
    multipart: { name: 'Dup User', email: dupEmail, password: 'Password1!' },
  });

  expect([200, 201, 409]).toContain(seed.status());

  await page.goto('/registration');

  await page.fill('#name', 'Dup User');
  await page.fill('#email', dupEmail);
  await page.fill('#password', 'Password1!');
  await page.fill('#confirmPassword', 'Password1!');

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/auth/register') && r.status() === 409),
    page.click('button[type="submit"]'),
  ]);

  await expect(page.getByText(/user with this email already exists!/i)).toBeVisible({ timeout: 15000 });
});
