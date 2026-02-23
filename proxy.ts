import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const isPublicRoute    = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isRootRoute       = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Not signed in — only public routes are accessible
  if (!userId) return;

  const [dbUser] = await db
    .select({ onboardingComplete: users.onboardingComplete })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  const onboarded = dbUser?.onboardingComplete;

  // Signed in but not onboarded → redirect to onboarding
  if (!onboarded && !isOnboardingRoute(request) && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Already onboarded but visiting onboarding or root → redirect to home
  if (onboarded && (isOnboardingRoute(request) || isRootRoute(request))) {
    return NextResponse.redirect(new URL('/home', request.url));
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
