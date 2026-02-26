'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, or } from 'drizzle-orm';
import type { AnyColumn } from 'drizzle-orm';
import { db } from '@/db';
import { users, books, readingLists, friendships } from '@/db/schema';

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

  const [userBooks, userReadingLists] = await Promise.all([
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
  ]);

  const totalWords = userBooks.reduce((sum, b) => sum + b.wordCount, 0);
  const totalChapters = userBooks.reduce((sum, b) => sum + b.chapterCount, 0);

  return {
    user: profileUser,
    books: userBooks,
    readingLists: userReadingLists,
    stats: { bookCount: userBooks.length, totalWords, totalChapters },
    isOwnProfile,
    currentUserId,
  };
}
