import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Next.js must not parse the body — Stripe needs the raw bytes to verify the signature
export const runtime = 'nodejs';

async function setUserPremium(
  customerId: string,
  subscription: Stripe.Subscription,
  isPremium: boolean,
) {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await db
    .update(users)
    .set({
      premium: isPremium,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    })
    .where(eq(users.stripeCustomerId, customerId));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const customerId = session.customer as string;

        // If userId was stored in metadata, make sure stripeCustomerId is set
        const userId = session.metadata?.userId;
        if (userId) {
          await db
            .update(users)
            .set({ stripeCustomerId: customerId })
            .where(eq(users.id, userId));
        }

        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await setUserPremium(customerId, subscription, isActive);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await setUserPremium(customerId, subscription, isActive);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await db
          .update(users)
          .set({
            premium: false,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );
        const customerId = invoice.customer as string;
        await setUserPremium(customerId, subscription, true);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.customer) break;
        await db
          .update(users)
          .set({ premium: false, updatedAt: new Date() })
          .where(eq(users.stripeCustomerId, invoice.customer as string));
        break;
      }
    }
  } catch (err) {
    console.error('[Stripe webhook error]', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
