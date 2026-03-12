'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, eq, or } from 'drizzle-orm';
import type { AnyColumn } from 'drizzle-orm';
import { db } from '@/db';
import { users, books, readingLists, friendships, clubMembers, hiveMembers, prompts } from '@/db/schema';

export async function getCurrentUserAction() {
  const userId = await requireAuth();
  if (!userId) return null;
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function updateUserAvatarAction(
  image: string,
): Promise<{ success: boolean; message: string }> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized' };
  try {
    await db.update(users).set({ image, updatedAt: new Date() }).where(eq(users.id, userId));
    return { success: true, message: 'Photo updated.' };
  } catch {
    return { success: false, message: 'Failed to update photo.' };
  }
}

export async function deleteUserAccountAction(): Promise<{ success: boolean; message: string }> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized' };
  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true, message: 'Account deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete account. Please try again.' };
  }
}

export async function getCurrentUserImageUrlAction(): Promise<string | null> {
  const userId = await requireAuth();
  if (!userId) return null;
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { image: true },
  });
  return row?.image ?? null;
}

export async function getUserProfileAction(username: string) {
  const currentUserId = await getOptionalUserId();

  let profileUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!profileUser && username.startsWith('user_')) {
    profileUser = await db.query.users.findFirst({
      where: eq(users.id, username),
    });
  }

  if (!profileUser) return null;

  const isOwnProfile = currentUserId === profileUser.id;

  let isFriend = false;
  if (currentUserId && !isOwnProfile) {
    const f = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.status, 'ACCEPTED'),
        or(
          and(
            eq(friendships.requesterId, currentUserId),
            eq(friendships.addresseeId, profileUser.id),
          ),
          and(
            eq(friendships.requesterId, profileUser.id),
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
        ? eq(books.userId, profileUser.id)
        : and(
            eq(books.userId, profileUser.id),
            privacyFilter(books.privacy),
          ),
      orderBy: (b, { desc }) => [desc(b.updatedAt)],
    }),
    db.query.readingLists.findMany({
      where: isOwnProfile
        ? eq(readingLists.userId, profileUser.id)
        : and(
            eq(readingLists.userId, profileUser.id),
            privacyFilter(readingLists.privacy),
          ),
      orderBy: (rl, { desc }) => [desc(rl.updatedAt)],
    }),
    db.query.clubMembers.findMany({
      where: eq(clubMembers.userId, profileUser.id),
      with: { club: true },
      orderBy: (cm, { desc }) => [desc(cm.joinedAt)],
    }),
    db.query.hiveMembers.findMany({
      where: eq(hiveMembers.userId, profileUser.id),
      with: { hive: true },
      orderBy: (hm, { desc }) => [desc(hm.joinedAt)],
    }),
    db.query.prompts.findMany({
      where: isOwnProfile
        ? eq(prompts.creatorId, profileUser.id)
        : and(eq(prompts.creatorId, profileUser.id), eq(prompts.privacy, 'PUBLIC')),
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
