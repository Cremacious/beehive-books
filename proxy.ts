import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isRootRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    if (!isPublicRoute(request)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return;
  }

  const metadata = sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined;
  let onboarded =
    metadata?.onboardingComplete === true ||
    request.cookies.get('onboarding-done')?.value === '1';

  if (!onboarded) {
    const [dbUser] = await db
      .select({ onboardingComplete: users.onboardingComplete })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    onboarded = dbUser?.onboardingComplete === true;
  }

  if (!onboarded && !isOnboardingRoute(request) && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (onboarded && (isOnboardingRoute(request) || isRootRoute(request))) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
