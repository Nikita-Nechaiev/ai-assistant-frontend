import { randomUUID } from 'node:crypto';

import { APIRequestContext, expect, Page } from '@playwright/test';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:3000';

export interface TestAccount {
  name: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${randomUUID()}@example.com`;
}

// Each test owns its account, session data and refresh token, including in parallel runs.
export async function createAccount(request: APIRequestContext): Promise<TestAccount> {
  const credentials = { name: 'E2E User', email: uniqueEmail(), password: 'Password1!' };
  const registration = await request.post(`${API_URL}/auth/register`, { multipart: credentials });

  expect(registration.status()).toBe(201);
  expect((await registration.json()).user).toMatchObject({ name: credentials.name, email: credentials.email });

  const login = await request.post(`${API_URL}/auth/login`, { data: credentials });

  expect(login.status()).toBe(200);

  const { accessToken } = await login.json();
  const refreshCookie = login
    .headersArray()
    .find((header) => header.name.toLowerCase() === 'set-cookie' && header.value.startsWith('refreshToken='));

  expect(accessToken).toEqual(expect.any(String));
  expect(refreshCookie, 'Login must issue a refresh token').toBeDefined();

  return {
    ...credentials,
    accessToken,
    refreshToken: refreshCookie!.value.split(';')[0].slice('refreshToken='.length),
  };
}

export async function expectDashboard(page: Page) {
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Welcome back, E2E.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your sessions', exact: true })).toBeVisible();
}

export async function createSession(request: APIRequestContext, account: TestAccount) {
  const name = `E2E Session ${randomUUID()}`;
  const response = await request.post(`${API_URL}/collaboration-session/create`, {
    data: { name },
    headers: { Cookie: `accessToken=${account.accessToken}` },
  });

  expect(response.status()).toBe(201);

  const session = await response.json();

  expect(session).toMatchObject({ id: expect.any(Number), name });

  return session.id as number;
}
