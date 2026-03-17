import { NextRequest, NextResponse } from 'next/server';
import { signUpLimiter, signInLimiter, checkoutLimiter, apiLimiter, pageLimiter } from '@/lib/rate-limit';

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up'];

// Known malicious/scanner user-agent fragments
const BLOCKED_UA_PATTERNS = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
  'dirbuster', 'gobuster', 'wfuzz', 'nuclei', 'acunetix',
  'nessus', 'openvas', 'w3af', 'skipfish',
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'),
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

  // ── Rate limit auth endpoints ──────────────────────────────────────────────
  if (pathname.startsWith('/api/auth')) {
    let result;
    if (pathname.includes('/sign-up')) {
      result = await signUpLimiter.limit(ip);
    } else if (pathname.includes('/sign-in')) {
      result = await signInLimiter.limit(ip);
    } else {
      result = await apiLimiter.limit(ip);
    }
    if (!result.success) return rateLimitedResponse();
    return NextResponse.next();
  }

  // ── Rate limit Stripe endpoints ────────────────────────────────────────────
  if (pathname.startsWith('/api/stripe')) {
    // Webhooks come from Stripe servers — never rate limit them
    if (!pathname.includes('/webhook')) {
      const result = await checkoutLimiter.limit(ip);
      if (!result.success) return rateLimitedResponse(3600);
    }
    return NextResponse.next();
  }

  // ── Rate limit all other API routes ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const result = await apiLimiter.limit(ip);
    if (!result.success) return rateLimitedResponse();
    return NextResponse.next();
  }

  // ── Rate limit page routes (DDoS protection) ──────────────────────────────
  const pageResult = await pageLimiter.limit(ip);
  if (!pageResult.success) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
    });
  }

  // ── Page route auth guard ─────────────────────────────────────────────────
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
