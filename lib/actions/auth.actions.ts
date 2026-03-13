'use server';

import { requireAuth } from '@/lib/require-auth';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export type OnboardingState = { error: string };

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function checkUsernameAvailableAction(
  username: string,
): Promise<{ available: boolean; error?: string }> {
  const userId = await requireAuth();

  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
    };
  }

  const existing = await db.query.users.findFirst({
    where: sql`LOWER(${users.username}) = LOWER(${username})`,
    columns: { id: true },
  });

  if (existing && existing.id !== userId) {
    return { available: false };
  }

  return { available: true };
}

export async function completeOnboarding(
  username: string,
  imageUrl?: string,
): Promise<OnboardingState> {
  const userId = await requireAuth();

  const trimmed = username.trim();
  if (!trimmed) return { error: 'Username is required.' };
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
    };
  }

  try {
    const updateFields: Record<string, unknown> = {
      username: trimmed,
      onboardingComplete: true,
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateFields.image = imageUrl;
    }

    await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, userId));
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

  const cookieStore = await cookies();
  cookieStore.set('onboarding-done', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60,
  });

  return { error: '' };
}
