import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  await db
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
    });
}
