import { test, expect } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function randomEmail() {
  return `e2e_${Date.now()}@example.com`;
}

test.beforeAll(async ({ request }) => {
  const res = await request.get(`${API_URL}/health`, { timeout: 5000 });

  expect(res.ok()).toBeTruthy();
});

test('New user can register and reach dashboard', async ({ page }) => {
  await page.goto('/registration');

  await expect(page.locator('#name')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password');

  await page.fill('#name', 'E2E User');

  const email = randomEmail();

  await page.fill('#email', email);
  await page.fill('#password', 'Password1!');
  await page.fill('#confirmPassword', 'Password1!');

  await expect(page.locator('#email')).toHaveValue(email);
  await expect(page.locator('button[type="submit"]')).toBeEnabled();

  const [res] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/auth/register')),
    page.click('button[type="submit"]'),
  ]);

  expect([200, 201]).toContain(res.status());

  const ct = res.headers()['content-type'] || '';

  if (ct.includes('application/json')) {
    const body = await res.json().catch(() => null);

    expect(body).not.toBeNull();
  }

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Sessions' })).toBeVisible();
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

  await expect(page.locator('button[type="submit"]')).toBeEnabled();

  const [res] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/auth/register')),
    page.click('button[type="submit"]'),
  ]);

  expect([200, 201, 409]).toContain(res.status());

  const ct = res.headers()['content-type'] || '';

  if (ct.includes('application/json')) {
    const body = await res.json().catch(() => null);

    if (body && typeof body === 'object' && 'message' in body) {
      expect(String((body as any).message).toLowerCase()).toMatch(/already|exist/);
    }
  }

  await expect(page).toHaveURL(/\/registration/);
  await expect(page.getByText(/user with this email already exists!/i)).toBeVisible({ timeout: 15000 });
  await expect(page.locator('button[type="submit"]')).toBeEnabled();
});
