import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === '/sign-in') return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${encodeURIComponent(path)}`, req.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspace/:path*',
    '/payment-method',
    '/place-order',
    '/profile',
    '/order/:path*',
    '/admin',
  ],
};
