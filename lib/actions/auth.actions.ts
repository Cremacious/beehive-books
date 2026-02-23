'use server';

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type OnboardingState = { error: string };

export async function completeOnboarding(
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const user = await currentUser();
  if (!user) return { error: 'Not authenticated.' };

  const username = user.username;
  if (!username) {
    return { error: 'No username found on your account. Please contact support.' };
  }

  try {
    const client = await clerkClient();

    // Upload profile image to Clerk if one was provided
    const imageFile = formData.get('avatar');
    if (imageFile instanceof File && imageFile.size > 0) {
      await client.users.updateUserProfileImage(userId, { file: imageFile });
    }

    // Persist username + mark onboarding complete in the DB
    await db
      .update(users)
      .set({ username, onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.clerkId, userId));

    // Sync flag to Clerk metadata so the middleware sees it immediately
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
