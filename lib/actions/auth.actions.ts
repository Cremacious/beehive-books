'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { syncUser } from '@/sync-user';

export type OnboardingState = { error: string };

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function checkUsernameAvailableAction(
  username: string,
): Promise<{ available: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { available: false, error: 'Not authenticated.' };

  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
    };
  }

  const existing = await db.query.users.findFirst({
    where: sql`LOWER(${users.username}) = LOWER(${username})`,
    columns: { clerkId: true },
  });


  if (existing && existing.clerkId !== userId) {
    return { available: false };
  }

  return { available: true };
}

export async function completeOnboarding(
  username: string,
  imageUrl?: string,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const trimmed = username.trim();
  if (!trimmed) return { error: 'Username is required.' };
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
    };
  }

  try {
    await syncUser();

    const updateFields: Record<string, unknown> = {
      username: trimmed,
      onboardingComplete: true,
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateFields.imageUrl = imageUrl;
    }

    await db
      .update(users)
      .set(updateFields)
      .where(eq(users.clerkId, userId));

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true, username: trimmed },
    });
  } catch (err: unknown) {
    console.error('Onboarding error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    const causeMsg =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : '';
    if (
      msg.includes('unique') ||
      msg.includes('duplicate') ||
      msg.includes('violates') ||
      causeMsg.includes('duplicate') ||
      causeMsg.includes('unique')
    ) {
      return { error: 'That username is already taken.' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }

  return { error: '' };
}
