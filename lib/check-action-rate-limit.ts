'use server';

import { actionLimiter } from '@/lib/rate-limit';

/**
 * Call at the top of any server action that can be spammed.
 * Uses the userId as the rate limit key so limits are per-user, not per-IP.
 *
 * Returns an error string if rate limited, null if OK.
 *
 * Usage:
 *   const limited = await checkActionRateLimit(userId);
 *   if (limited) return { error: limited };
 */
export async function checkActionRateLimit(userId: string): Promise<string | null> {
  const { success } = await actionLimiter.limit(userId);
  if (!success) return 'You are doing that too fast. Please wait a moment.';
  return null;
}
