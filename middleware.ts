import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up'];
const ONBOARDING_PATH = '/onboarding';

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'),
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let better-auth handle its own API routes without interference
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id ?? null;

  // Unauthenticated: only allow public routes
  if (!userId) {
    if (!isPublic(pathname)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // Authenticated: check onboarding status
  const [dbUser] = await db
    .select({ onboardingComplete: users.onboardingComplete })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const onboarded = dbUser?.onboardingComplete === true;

  // Not yet onboarded → must go to /onboarding (except public routes)
  if (!onboarded && pathname !== ONBOARDING_PATH && !isPublic(pathname)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Onboarded user visiting root or onboarding → send to /home
  if (onboarded && (pathname === '/' || pathname === ONBOARDING_PATH)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Signed-in user visiting sign-in/sign-up → send to /home
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
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
