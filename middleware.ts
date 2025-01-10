import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/get-tokens`;

  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const refreshResponse = await axios.get(refreshUrl, {
      withCredentials: true,
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (refreshResponse.status === 200) {
      const { accessToken, newRefreshToken, user } = refreshResponse.data;
      console.log(user);

      const res = NextResponse.next();
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
        sameSite: 'strict',
      });

      res.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.headers.set('x-user', JSON.stringify(user));

      return res;
    }

    url.pathname = '/login';
    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error refreshing token:', error.message);
    }

    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/session/:path*',
    '/document/:path*',
    '/ai-assistance',
    '/settings',
    '/faq',
  ],
};
