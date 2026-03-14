import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const [dbUser] = await db
    .select({ stripeCustomerId: users.stripeCustomerId, premium: users.premium })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Already premium — redirect to portal instead
  if (dbUser?.premium) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
  }

  // Reuse existing Stripe customer or create new one
  let customerId = dbUser?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
  }

  const appUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/premium/success`,
    cancel_url: `${appUrl}/premium`,
    metadata: { userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
