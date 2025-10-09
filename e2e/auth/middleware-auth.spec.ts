import { test, expect, APIRequestContext } from '@playwright/test';

const ORIGIN = 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const E2E_EMAIL = process.env.E2E_EMAIL!;
const E2E_PASSWORD = process.env.E2E_PASSWORD!;

async function ensureUser(request: APIRequestContext) {
  const login = () => request.post(`${API_URL}/auth/login`, { data: { email: E2E_EMAIL, password: E2E_PASSWORD } });
  let resp = await login();

  if (resp.status() === 401) {
    const reg = await request.post(`${API_URL}/auth/register`, {
      multipart: { name: 'E2E Bot', email: E2E_EMAIL, password: E2E_PASSWORD },
    });

    expect([200, 201, 409]).toContain(reg.status());
    resp = await login();
  }

  return resp;
}

async function getFreshRefreshToken(request: APIRequestContext): Promise<string> {
  const resp = await ensureUser(request);

  expect([200, 201]).toContain(resp.status());

  const setCookies = resp
    .headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value);
  const rtPair = setCookies.map((c) => c.split(';')[0]).find((p) => p.trim().startsWith('refreshToken='));

  expect(rtPair, 'refreshToken cookie should be present on login response').toBeTruthy();

  return rtPair!.split('=').slice(1).join('=');
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
