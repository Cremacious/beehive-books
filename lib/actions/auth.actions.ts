'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type OnboardingState = { error: string };

export async function completeOnboarding(
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const username = (formData.get('username') as string | null)?.trim() ?? '';

  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: 'Only letters, numbers, and underscores allowed.' };
  }

  try {
    await db
      .update(users)
      .set({ username, onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.clerkId, userId));

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique')) return { error: 'That username is already taken.' };
    return { error: 'Something went wrong. Please try again.' };
  }

  return { error: '' };
}
