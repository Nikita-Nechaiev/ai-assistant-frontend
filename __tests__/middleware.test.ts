/** @jest-environment node */
import { middleware, config } from '../middleware';

jest.mock('next/server', () => ({
  NextResponse: {
    next: (options: any) => ({ kind: 'next', options, cookies: { set: jest.fn(), delete: jest.fn() } }),
    redirect: (url: URL) => ({ kind: 'redirect', url: url.pathname, cookies: { set: jest.fn(), delete: jest.fn() } }),
  },
}));

const request = (path: string, cookies: Record<string, string> = {}) =>
  ({
    nextUrl: { clone: () => new URL(path, 'https://example.com') },
    headers: new Headers({ 'x-user': 'untrusted' }),
    cookies: { get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined) },
  }) as any;
const response = (ok: boolean, data?: any) => ({ ok, json: async () => data });

beforeEach(() => {
  global.fetch = jest.fn();
});
it.each(['/login', '/registration', '/forgot-password', '/reset-password/token'])(
  'lets anonymous users access %s and redirects signed-in users',
  async (path) => {
    expect(((await middleware(request(path))) as any).kind).toBe('next');
    expect(((await middleware(request(path, { accessToken: 'token' }))) as any).url).toBe('/dashboard');
  },
);
it.each(['/', '/welcome'])('keeps %s public and removes forged user headers', async (path) => {
  const result: any = await middleware(request(path));

  expect(result.kind).toBe('next');
  expect(result.options.request.headers.has('x-user')).toBe(false);
});
it.each(['/', '/dashboard'])('forwards an authenticated Unicode user on %s', async (path) => {
  (fetch as jest.Mock).mockResolvedValue(response(true, { id: 1, name: 'Микита' }));

  const result: any = await middleware(request(path, { accessToken: 'access' }));

  expect(JSON.parse(Buffer.from(result.options.request.headers.get('x-user'), 'base64').toString())).toEqual({
    id: 1,
    name: 'Микита',
  });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/auth/me'),
    expect.objectContaining({ cache: 'no-store', headers: { Cookie: 'accessToken=access' } }),
  );
});
it.each(['/', '/dashboard'])('refreshes expired access on %s and sets an HTTP-only access cookie', async (path) => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce(response(false))
    .mockResolvedValueOnce(response(true, { accessToken: 'new', user: { id: 1 } }));

  const result: any = await middleware(request(path, { accessToken: 'old', refreshToken: 'refresh' }));

  expect(result.kind).toBe('next');
  expect(result.cookies.set).toHaveBeenCalledWith(
    'accessToken',
    'new',
    expect.objectContaining({ httpOnly: true, sameSite: 'strict', maxAge: 900 }),
  );
});
it('uses secure, domain-scoped cookies in production', async () => {
  const environment = process.env.NODE_ENV;

  (process.env as any).NODE_ENV = 'production';

  try {
    (fetch as jest.Mock).mockResolvedValue(response(true, { accessToken: 'new', user: { id: 1 } }));

    const result: any = await middleware(request('/dashboard', { refreshToken: 'r' }));

    expect(result.cookies.set).toHaveBeenCalledWith(
      'accessToken',
      'new',
      expect.objectContaining({ secure: true, domain: '.ai-editor-portfolio.com' }),
    );
  } finally {
    (process.env as any).NODE_ENV = environment;
  }
});
it('redirects unauthenticated protected requests and clears invalid cookies', async () => {
  const result: any = await middleware(request('/dashboard'));

  expect(result.url).toBe('/login');
  expect(result.cookies.delete).toHaveBeenCalledWith('accessToken');
  expect(result.cookies.delete).toHaveBeenCalledWith('refreshToken');
});
it.each([false, true])('handles failed refreshes without hiding the public page (%s)', async (reject) => {
  for (const path of ['/welcome', '/dashboard']) {
    (fetch as jest.Mock).mockReset();

    if (reject) (fetch as jest.Mock).mockRejectedValue('network');
    else (fetch as jest.Mock).mockResolvedValue(response(false));

    const result: any = await middleware(request(path, { refreshToken: 'r' }));

    expect(result.kind).toBe(path === '/welcome' ? 'next' : 'redirect');
  }
});
it('handles network errors fetching the user and malformed optional refresh data', async () => {
  (fetch as jest.Mock).mockRejectedValueOnce(Error('network')).mockResolvedValueOnce(response(true, {}));

  const result: any = await middleware(request('/', { accessToken: 'a', refreshToken: 'r' }));

  expect(result.options.request.headers.has('x-user')).toBe(false);

  const log = jest.spyOn(console, 'log').mockImplementation(() => {});

  (fetch as jest.Mock).mockRejectedValue(Error('offline'));
  expect(((await middleware(request('/dashboard', { refreshToken: 'r' }))) as any).url).toBe('/login');
  log.mockRestore();
  expect(config.matcher).toContain('/faq');
});
