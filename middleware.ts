import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  signUpLimiter,
  signInLimiter,
  checkoutLimiter,
  apiLimiter,
  pageLimiter,
} from '@/lib/rate-limit';

const intlMiddleware = createMiddleware(routing);

// Public paths WITHOUT locale prefix (next-intl strips it before matching)
const PUBLIC_PATHS = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/explore',
  '/books',
];

// Known malicious/scanner user-agent fragments
const BLOCKED_UA_PATTERNS = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
  'dirbuster', 'gobuster', 'wfuzz', 'nuclei', 'acunetix',
  'nessus', 'openvas', 'w3af', 'skipfish',
];

/** Strip a leading locale segment (e.g. /es/home → /home, /home → /home) */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|es|fr|de|pt)(?=\/|$)/, '') || '/';
}

function isPublic(pathname: string): boolean {
  const p = stripLocale(pathname);
  return PUBLIC_PATHS.some((pub) =>
    pub === '/' ? p === '/' : p === pub || p.startsWith(pub + '/'),
  );
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function rateLimitedResponse(retryAfter = 60) {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

function isSuspiciousBot(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent')?.toLowerCase() ?? '';
  return BLOCKED_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ── Block known scanner / attack tools ────────────────────────────────────
  if (isSuspiciousBot(request)) {
    return new NextResponse(null, { status: 403 });
  }

  const isDev = process.env.NODE_ENV === 'development';

  // ── Rate limit auth endpoints ──────────────────────────────────────────────
  if (pathname.startsWith('/api/auth')) {
    if (!isDev) {
      let result;
      if (pathname.includes('/sign-up')) {
        result = await signUpLimiter.limit(ip);
      } else if (pathname.includes('/sign-in')) {
        result = await signInLimiter.limit(ip);
      } else {
        result = await apiLimiter.limit(ip);
      }
      if (!result.success) return rateLimitedResponse();
    }
    return NextResponse.next();
  }

  // ── Rate limit Stripe endpoints ────────────────────────────────────────────
  if (pathname.startsWith('/api/stripe')) {
    // Webhooks come from Stripe servers — never rate limit them
    if (!isDev && !pathname.includes('/webhook')) {
      const result = await checkoutLimiter.limit(ip);
      if (!result.success) return rateLimitedResponse(3600);
    }
    return NextResponse.next();
  }

  // ── Rate limit all other API routes ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (!isDev) {
      const result = await apiLimiter.limit(ip);
      if (!result.success) return rateLimitedResponse();
    }
    return NextResponse.next();
  }

  // ── Rate limit page routes (DDoS protection) ──────────────────────────────
  if (!isDev) {
    const pageResult = await pageLimiter.limit(ip);
    if (!pageResult.success) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
      });
    }
  }

  // ── Page route auth guard ─────────────────────────────────────────────────
  const sessionToken =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token');

  const isAuthenticated = !!sessionToken;
  const pathWithoutLocale = stripLocale(pathname);

  if (!isAuthenticated && !isPublic(pathname)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthenticated && pathWithoutLocale === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // ── Email verification guard ───────────────────────────────────────────────
  // Only check protected routes — skip public paths and sign-in itself to avoid loops
  if (
    isAuthenticated &&
    !isPublic(pathname) &&
    pathWithoutLocale !== '/sign-in' &&
    process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
  ) {
    try {
      const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/auth/get-session`, {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user && data.user.emailVerified === false) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }
      }
    } catch {
      // If we can't reach the session API, fail open so a server error
      // doesn't lock everyone out of the app.
    }
  }

  // ── Delegate to next-intl for locale detection + cookie/header injection ──
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
