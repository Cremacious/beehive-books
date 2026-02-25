import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const [dbUser] = await db
    .insert(users)
    .values({
      clerkId:   user.id,
      email,
      firstName: user.firstName,
      lastName:  user.lastName,
      imageUrl:  user.imageUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        firstName: user.firstName,
        lastName:  user.lastName,
        imageUrl:  user.imageUrl,
        updatedAt: new Date(),
      },
    })
    .returning({ onboardingComplete: users.onboardingComplete, username: users.username });

  // Sync any missing publicMetadata fields back to Clerk in a single call
  const missingOnboarding = dbUser?.onboardingComplete && !user.publicMetadata?.onboardingComplete;
  const missingUsername   = dbUser?.username && !user.publicMetadata?.username;

  if (missingOnboarding || missingUsername) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        ...(missingOnboarding ? { onboardingComplete: true } : {}),
        ...(missingUsername   ? { username: dbUser!.username } : {}),
      },
    });
  }
}
