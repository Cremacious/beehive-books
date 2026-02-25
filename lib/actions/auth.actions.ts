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

  const username =
    user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0];
  if (!username) {
    return { error: 'Unable to generate username. Please contact support.' };
  }

  try {
    await syncUser();

    const client = await clerkClient();

    const imageFile = formData.get('avatar');
    if (imageFile instanceof File && imageFile.size > 0) {
      await client.users.updateUserProfileImage(userId, { file: imageFile });
    }

    await db
      .update(users)
      .set({ username, onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.clerkId, userId));

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique'))
      return { error: 'That username is already taken.' };
    return { error: 'Something went wrong. Please try again.' };
  }

  return { error: '' };
}
