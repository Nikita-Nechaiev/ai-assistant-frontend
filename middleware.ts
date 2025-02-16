import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (
    url.pathname === '/login' ||
    url.pathname === '/registration' ||
    url.pathname === '/forgot-password' ||
    url.pathname.startsWith('/reset-password')
  ) {
    console.log('authPage')
    const accessToken = req.cookies.get('accessToken')?.value;
    if (accessToken) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  const refreshToken = req.cookies.get('refreshToken')?.value;
  console.log('here1', refreshToken)

  if (!refreshToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  }

  const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/get-tokens`;

  try {
    console.log('here2')
    const refreshResponse = await axios.get(refreshUrl, {
      withCredentials: true,
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    console.log('here3')
    if (refreshResponse.status === 200) {
      const { accessToken, newRefreshToken, user } = refreshResponse.data;

      const res = NextResponse.next();
      console.log('here4', accessToken, refreshResponse, user)

      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60,
        sameSite: 'strict',
      });
      res.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        sameSite: 'strict',
      });
      res.headers.set('x-user', JSON.stringify(user));
      return res;
    }

    console.log('here5')

    const failUrl = req.nextUrl.clone();
    failUrl.pathname = '/login';

    const failRes = NextResponse.redirect(failUrl);
    failRes.cookies.delete('accessToken');
    failRes.cookies.delete('refreshToken');
    return failRes;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Error refreshing token:', error.message);
    }
    console.log('here6')
    const errUrl = req.nextUrl.clone();
    errUrl.pathname = '/login';

    const errRes = NextResponse.redirect(errUrl);
    errRes.cookies.delete('accessToken');
    errRes.cookies.delete('refreshToken');
    return errRes;
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
    '/login',
    '/registration',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};
