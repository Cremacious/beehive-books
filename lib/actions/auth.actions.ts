'use server';

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { syncUser } from '@/sync-user';

export type OnboardingState = { error: string };

export async function completeOnboarding(
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const user = await currentUser();
  if (!user) return { error: 'Not authenticated.' };

  const baseUsername = user.emailAddresses[0]?.emailAddress?.split('@')[0];
  const username = baseUsername
    ? `${baseUsername}_${userId.slice(-4)}`
    : `user_${userId.slice(-4)}`;
  if (!username) {
    return { error: 'Unable to generate username. Please contact support.' };
  }

  try {
    await syncUser();

    const client = await clerkClient();

    const imageFile = formData.get('avatar');
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        await client.users.updateUserProfileImage(userId, { file: imageFile });
      } catch (imageErr) {
        console.error('Failed to upload profile image:', imageErr);

      }
    }

    await db
      .update(users)
      .set({ username, onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.clerkId, userId));

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true, username },
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
    )
      return { error: 'That username is already taken.' };
    return { error: 'Something went wrong. Please try again.' };
  }

  return { error: '' };
}
