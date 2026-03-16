import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up'];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'),
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let auth and payment API routes pass through
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/stripe')) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token');

  const isAuthenticated = !!sessionToken;

  if (!isAuthenticated) {
    if (!isPublic(pathname)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // Authenticated user visiting root → send to /home
  // /sign-in and /sign-up are handled by the auth layout with proper session
  // validation, to avoid redirect loops when the session cookie is stale.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
