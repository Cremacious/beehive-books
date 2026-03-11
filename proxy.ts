import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

  // Primary: read from JWT (zero DB cost). Fallback: short-lived cookie set by
  // completeOnboarding() for the window before the JWT refreshes.
  const metadata = sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined;
  const onboarded =
    metadata?.onboardingComplete === true ||
    request.cookies.get('onboarding-done')?.value === '1';

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
