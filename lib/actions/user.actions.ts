'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, or } from 'drizzle-orm';
import type { AnyColumn } from 'drizzle-orm';
import { db } from '@/db';
import { users, books, readingLists, friendships, clubMembers, hiveMembers, prompts } from '@/db/schema';

export async function getCurrentUserImageUrlAction(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const row = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: { imageUrl: true },
  });
  return row?.imageUrl ?? null;
}

export async function getUserProfileAction(username: string) {
  const { userId: currentUserId } = await auth();

  let profileUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!profileUser && username.startsWith('user_')) {
    profileUser = await db.query.users.findFirst({
      where: eq(users.clerkId, username),
    });
  }

  if (!profileUser) return null;

  const isOwnProfile = currentUserId === profileUser.clerkId;

  let isFriend = false;
  if (currentUserId && !isOwnProfile) {
    const f = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.status, 'ACCEPTED'),
        or(
          and(
            eq(friendships.requesterId, currentUserId),
            eq(friendships.addresseeId, profileUser.clerkId),
          ),
          and(
            eq(friendships.requesterId, profileUser.clerkId),
            eq(friendships.addresseeId, currentUserId),
          ),
        ),
      ),
    });
    isFriend = !!f;
  }

  const visiblePrivacies = isOwnProfile
    ? undefined
    : isFriend
      ? (['PUBLIC', 'FRIENDS'] as const)
      : (['PUBLIC'] as const);

  const privacyFilter = (col: AnyColumn) =>
    visiblePrivacies
      ? or(...visiblePrivacies.map((p) => eq(col, p)))
      : undefined;

  const [userBooks, userReadingLists, memberClubs, memberHives, userPrompts] = await Promise.all([
    db.query.books.findMany({
      where: isOwnProfile
        ? eq(books.userId, profileUser.clerkId)
        : and(
            eq(books.userId, profileUser.clerkId),
            privacyFilter(books.privacy),
          ),
      orderBy: (b, { desc }) => [desc(b.updatedAt)],
    }),
    db.query.readingLists.findMany({
      where: isOwnProfile
        ? eq(readingLists.userId, profileUser.clerkId)
        : and(
            eq(readingLists.userId, profileUser.clerkId),
            privacyFilter(readingLists.privacy),
          ),
      orderBy: (rl, { desc }) => [desc(rl.updatedAt)],
    }),
    db.query.clubMembers.findMany({
      where: eq(clubMembers.userId, profileUser.clerkId),
      with: { club: true },
      orderBy: (cm, { desc }) => [desc(cm.joinedAt)],
    }),
    db.query.hiveMembers.findMany({
      where: eq(hiveMembers.userId, profileUser.clerkId),
      with: { hive: true },
      orderBy: (hm, { desc }) => [desc(hm.joinedAt)],
    }),
    db.query.prompts.findMany({
      where: isOwnProfile
        ? eq(prompts.creatorId, profileUser.clerkId)
        : and(eq(prompts.creatorId, profileUser.clerkId), eq(prompts.privacy, 'PUBLIC')),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    }),
  ]);

  const visibleClubs = memberClubs
    .map((mc) => ({ ...mc.club, myRole: mc.role, isMember: true as const }))
    .filter((c) => isOwnProfile || c.privacy === 'PUBLIC');

  const visibleHives = memberHives
    .map((mh) => ({ ...mh.hive, myRole: mh.role, isMember: true as const }))
    .filter((h) => {
      if (isOwnProfile) return true;
      if (isFriend) return h.privacy !== 'PRIVATE';
      return h.privacy === 'PUBLIC';
    });

  return {
    user: profileUser,
    books: userBooks,
    readingLists: userReadingLists,
    clubs: visibleClubs,
    hives: visibleHives,
    prompts: userPrompts,
    isOwnProfile,
    isFriend,
    currentUserId,
  };
}
