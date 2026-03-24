'use server';

import { requireAuth } from '@/lib/require-auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function checkUsernameAction(
  username: string,
): Promise<{ available: boolean; error?: string }> {
  await requireAuth();

  if (!USERNAME_RE.test(username)) {
    return {
      available: false,
      error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
    };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { id: true },
  });

  return { available: !existing };
}

export async function completeOnboardingAction(data: {
  username?: string;
  bio?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const userId = await requireAuth();

  if (data.username) {
    if (!USERNAME_RE.test(data.username)) {
      return {
        success: false,
        error: 'Username must be 3–20 characters: letters, numbers, or underscores only.',
      };
    }
    const existing = await db.query.users.findFirst({
      where: eq(users.username, data.username),
      columns: { id: true },
    });
    if (existing && existing.id !== userId) {
      return { success: false, error: 'That username is already taken.' };
    }
  }

  await db
    .update(users)
    .set({
      ...(data.username ? { username: data.username } : {}),
      ...(data.bio !== undefined ? { bio: data.bio.trim() || null } : {}),
      ...(data.imageUrl ? { image: data.imageUrl } : {}),
      onboardingComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true };
}
