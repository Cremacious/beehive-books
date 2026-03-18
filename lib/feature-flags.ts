import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { featureFlags } from '@/db/schema';

/**
 * Deterministically maps a (userId, flagKey) pair to a bucket in [0, 99].
 * Uses a djb2-style XOR hash. The `>>> 0` converts the signed 32-bit result
 * of bitwise ops to an unsigned 32-bit integer before taking the modulus.
 */
function userBucket(userId: string, key: string): number {
  const str = `${userId}:${key}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep as unsigned 32-bit
  }
  return hash % 100;
}

/**
 * Check whether a feature flag is enabled for a given user.
 *
 * Rules:
 *  - If the flag doesn't exist or `enabled` is false → returns false.
 *  - If `rolloutPercentage` is 100 → returns true for every user.
 *  - Otherwise, the user's bucket (deterministic hash 0-99) must be less than
 *    `rolloutPercentage` for the flag to be active.
 *  - When no `userId` is supplied (anonymous request) the flag is only active
 *    when rolloutPercentage === 100.
 */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: eq(featureFlags.key, key),
    columns: { enabled: true, rolloutPercentage: true },
  });

  if (!flag || !flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (!userId) return false;

  return userBucket(userId, key) < flag.rolloutPercentage;
}

/**
 * Retrieve all feature flags (ordered newest first).
 * Used by the admin panel.
 */
export async function getAllFeatureFlags() {
  return db.query.featureFlags.findMany({
    orderBy: (f, { desc }) => desc(f.createdAt),
  });
}
