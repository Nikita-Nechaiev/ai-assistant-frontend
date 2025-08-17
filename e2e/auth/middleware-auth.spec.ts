import { test, expect, APIRequestContext } from '@playwright/test';

const ORIGIN = 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function getFreshRefreshToken(request: APIRequestContext): Promise<string> {
  const resp = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: process.env.E2E_EMAIL!,
      password: process.env.E2E_PASSWORD!,
    },
  });

  expect([200, 201]).toContain(resp.status());

  const setCookies = resp
    .headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value);

  const rtPair = setCookies.map((c) => c.split(';')[0]).find((p) => p.trim().startsWith('refreshToken='));

  expect(rtPair, 'refreshToken cookie should be present on login response').toBeTruthy();

  const refreshToken = rtPair!.split('=').slice(1).join('=');

  return refreshToken;
}

test('anonymous user is redirected to /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('middleware refresh returns 200 and exposes x-user header (API)', async ({ request }) => {
  const refreshToken = await getFreshRefreshToken(request);

  const res = await request.get(`${ORIGIN}/dashboard`, {
    headers: { Cookie: `refreshToken=${refreshToken}` },
  });

  expect(res.status()).toBe(200);

  const xUser = res.headers()['x-user'];

  expect(xUser).toBeTruthy();
});

test('middleware issues tokens in browser context (end-to-end)', async ({ context, page, request }) => {
  const refreshToken = await getFreshRefreshToken(request);

  await context.addCookies([
    {
      name: 'refreshToken',
      value: refreshToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    },
  ]);

  await page.goto(`${ORIGIN}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard$/);

  const cookies = await context.cookies(ORIGIN);
  const names = cookies.map((c) => c.name);

  expect(names).toEqual(expect.arrayContaining(['accessToken', 'refreshToken']));
});
