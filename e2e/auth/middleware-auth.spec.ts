import { BASE_URL, expectDashboard } from '../helpers';
import { test, expect } from './fixtures';

test('anonymous user is redirected to /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('middleware refresh returns 200 and keeps x-user internal', async ({ request, account }) => {
  // Explicit Cookie overrides the API context jar: the incoming request has no access token.
  const response = await request.get(`${BASE_URL}/dashboard`, {
    headers: { Cookie: `refreshToken=${account.refreshToken}` },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()['x-user']).toBeUndefined();

  const accessCookie = response
    .headersArray()
    .find((header) => header.name.toLowerCase() === 'set-cookie' && header.value.startsWith('accessToken='));

  expect(accessCookie?.value).toMatch(/^accessToken=.+;.*HttpOnly/i);
});

test('middleware issues tokens in browser context (end-to-end)', async ({ context, page, account }) => {
  await context.addCookies([
    {
      name: 'refreshToken',
      value: account.refreshToken,
      url: BASE_URL,
      httpOnly: true,
      secure: new URL(BASE_URL).protocol === 'https:',
      sameSite: 'Strict',
    },
  ]);
  expect((await context.cookies(BASE_URL)).map(({ name }) => name)).toEqual(['refreshToken']);

  await page.goto('/dashboard');
  await expectDashboard(page);

  const cookies = await context.cookies(BASE_URL);

  expect(cookies.map(({ name }) => name)).toEqual(expect.arrayContaining(['accessToken', 'refreshToken']));
  expect(cookies.find(({ name }) => name === 'accessToken')).toMatchObject({
    httpOnly: true,
    value: expect.any(String),
  });
  await page.reload();
  await expectDashboard(page);
});
