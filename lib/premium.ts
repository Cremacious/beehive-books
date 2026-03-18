import { and, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, books, bookClubs, hives, readingLists, prompts } from '@/db/schema';
import { PREMIUM_CONFIG, type PremiumResource } from '@/lib/config/premium.config';
import { isFeatureEnabled } from '@/lib/feature-flags';

const resourceCountQuery: Record<
  PremiumResource,
  (userId: string) => Promise<number>
> = {
  books: async (userId) => {
    const [row] = await db
      .select({ c: count() })
      .from(books)
      .where(eq(books.userId, userId));
    return row?.c ?? 0;
  },
  clubs: async (userId) => {
    const [row] = await db
      .select({ c: count() })
      .from(bookClubs)
      .where(eq(bookClubs.ownerId, userId));
    return row?.c ?? 0;
  },
  hives: async (userId) => {
    const [row] = await db
      .select({ c: count() })
      .from(hives)
      .where(eq(hives.ownerId, userId));
    return row?.c ?? 0;
  },
  readingLists: async (userId) => {
    const [row] = await db
      .select({ c: count() })
      .from(readingLists)
      .where(eq(readingLists.userId, userId));
    return row?.c ?? 0;
  },
  prompts: async (userId) => {
    const [row] = await db
      .select({ c: count() })
      .from(prompts)
      .where(eq(prompts.creatorId, userId));
    return row?.c ?? 0;
  },
};

const RESOURCE_LABELS: Record<PremiumResource, string> = {
  books: 'books',
  clubs: 'clubs',
  hives: 'hives',
  readingLists: 'reading lists',
  prompts: 'prompts',
};

export async function checkCreateLimit(
  userId: string,
  resource: PremiumResource,
): Promise<string | null> {
  // Feature flag: bypass all resource limits for users in the rollout
  const limitsDisabled = await isFeatureEnabled('disable_premium_limits', userId);
  if (limitsDisabled) return null;

  const [[userRow], currentCount] = await Promise.all([
    db.select({ premium: users.premium }).from(users).where(eq(users.id, userId)).limit(1),
    resourceCountQuery[resource](userId),
  ]);

  const isPremium = userRow?.premium === true;
  const limit = isPremium
    ? PREMIUM_CONFIG.limits.premium[resource]
    : PREMIUM_CONFIG.limits.free[resource];

  if (currentCount >= limit) {
    const label = RESOURCE_LABELS[resource];
    return isPremium
      ? `You have reached the maximum of ${limit} ${label}.`
      : `Beta accounts are limited to creating ${limit} ${label}. More features available later.`;
  }

  return null;
}
