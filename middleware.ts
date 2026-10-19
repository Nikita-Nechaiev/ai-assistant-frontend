import { NextRequest, NextResponse } from 'next/server';

type AuthCookieName = 'accessToken' | 'refreshToken';

type RefreshPayload = {
  accessToken: string;
  user: unknown;
};

function encodeUserHeader(user: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(user));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary);
}

function nextWithUser(req: NextRequest, user: unknown) {
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set('x-user', encodeUserHeader(user));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = isProduction ? '.ai-editor-portfolio.com' : undefined;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    domain: cookieDomain,
    path: '/',
  } as const;
}

function setAuthCookie(res: NextResponse, name: AuthCookieName, value: string) {
  const maxAge = name === 'accessToken' ? 15 * 60 : 30 * 24 * 60 * 60;

  res.cookies.set(name, value, { ...getAuthCookieOptions(), maxAge });
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = req.nextUrl.clone();

  loginUrl.pathname = '/login';

  const res = NextResponse.redirect(loginUrl);

  res.cookies.delete('accessToken');
  res.cookies.delete('refreshToken');

  return res;
}

async function fetchCurrentUser(accessToken: string, signal?: AbortSignal) {
  try {
    const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      cache: 'no-store',
      signal,
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
    });

    if (!meResponse.ok) return null;

    return await meResponse.json();
  } catch {
    return null;
  }
}

async function nextWithOptionalUser(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;

  if (accessToken) {
    const user = await fetchCurrentUser(accessToken, AbortSignal.timeout(2500));

    if (user) return nextWithUser(req, user);
  }

  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (refreshToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        cache: 'no-store',
        signal: AbortSignal.timeout(2500),
        headers: { Cookie: `refreshToken=${refreshToken}` },
      });

      if (response.ok) {
        const { accessToken: newAccessToken, user } = (await response.json()) as RefreshPayload;

        if (newAccessToken && user) {
          const res = nextWithUser(req, user);

          setAuthCookie(res, 'accessToken', newAccessToken);

          return res;
        }
      }
    } catch {
      // The public landing page remains available when the auth service is unavailable.
    }
  }

  const requestHeaders = new Headers(req.headers);

  requestHeaders.delete('x-user');

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname === '/' || url.pathname === '/welcome') return nextWithOptionalUser(req);

  if (
    url.pathname === '/login' ||
    url.pathname === '/registration' ||
    url.pathname === '/forgot-password' ||
    url.pathname.startsWith('/reset-password')
  ) {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (accessToken) {
      url.pathname = '/dashboard';

      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;

  if (accessToken) {
    const user = await fetchCurrentUser(accessToken);

    if (user) {
      return nextWithUser(req, user);
    }
  }

  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return redirectToLogin(req);
  }

  const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;

  try {
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken, user } = (await refreshResponse.json()) as RefreshPayload;

      const res = nextWithUser(req, user);

      setAuthCookie(res, 'accessToken', newAccessToken);

      return res;
    }

    return redirectToLogin(req);
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error refreshing token:', error.message);
    }

    return redirectToLogin(req);
  }
}

export const config = {
  matcher: [
    // protected routes (where we do the refresh logic)
    '/dashboard',
    '/session/:path*',
    '/document/:path*',
    '/ai-assistance/:path*',
    '/faq',
    // public routes we also want to check
    '/',
    '/welcome',
    '/login',
    '/registration',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};
