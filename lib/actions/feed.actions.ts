'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, eq, or, inArray, gt, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  friendships,
  users,
  books,
  chapters,
  bookClubs,
  clubDiscussions,
  prompts,
  readingLists,
  readingListBooks,
  readingListFollows,
  hives,
} from '@/db/schema';

const FEED_DAYS = 30;
const LIMIT_PER_TYPE = 10;

export type FeedEventType =
  | 'NEW_BOOK'
  | 'NEW_CHAPTER'
  | 'NEW_CLUB'
  | 'CLUB_DISCUSSION'
  | 'NEW_PROMPT'
  | 'NEW_READING_LIST'
  | 'NEW_HIVE'
  | 'LIST_NEW_BOOK';

export type FeedUser = {
  id: string;
  username: string | null;
  image: string | null;
};

export type FeedEvent = {
  id: string;
  type: FeedEventType;
  timestamp: Date;
  user: FeedUser;
  meta: Record<string, string | number>;
  link: string;
};

export async function getFriendFeedAction(): Promise<FeedEvent[]> {
  const userId = await requireAuth();
  if (!userId) return [];


  const friendshipRows = await db.query.friendships.findMany({
    where: and(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
      eq(friendships.status, 'ACCEPTED'),
    ),
  });

  const friendIds = friendshipRows.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );

  const cutoff = new Date(Date.now() - FEED_DAYS * 24 * 60 * 60 * 1000);

  // Followed list books — independent of friends
  const followedListIdRows = await db.query.readingListFollows.findMany({
    where: eq(readingListFollows.userId, userId),
    columns: { listId: true },
  });

  if (friendIds.length === 0 && followedListIdRows.length === 0) return [];


  const [
    friendUsers,
    recentBooks,
    friendBookRows,
    recentClubs,
    recentDiscussions,
    recentPrompts,
    recentLists,
    recentHives,
  ] = friendIds.length > 0 ? await Promise.all([
    db.query.users.findMany({
      where: inArray(users.id, friendIds),
      columns: { id: true, username: true, image: true },
    }),
    db.query.books.findMany({
      where: and(
        inArray(books.userId, friendIds),
        or(eq(books.privacy, 'PUBLIC'), eq(books.privacy, 'FRIENDS')),
        gt(books.createdAt, cutoff),
      ),
      columns: { id: true, userId: true, title: true, genre: true, createdAt: true },
      orderBy: [desc(books.createdAt)],
      limit: LIMIT_PER_TYPE,
    }),
    db.query.books.findMany({
      where: and(
        inArray(books.userId, friendIds),
        or(eq(books.privacy, 'PUBLIC'), eq(books.privacy, 'FRIENDS')),
      ),
      columns: { id: true, userId: true, title: true },
    }),
    db.query.bookClubs.findMany({
      where: and(
        inArray(bookClubs.ownerId, friendIds),
        or(eq(bookClubs.privacy, 'PUBLIC'), eq(bookClubs.privacy, 'FRIENDS')),
        gt(bookClubs.createdAt, cutoff),
      ),
      columns: { id: true, ownerId: true, name: true, createdAt: true },
      orderBy: [desc(bookClubs.createdAt)],
      limit: LIMIT_PER_TYPE,
    }),
    db.query.clubDiscussions.findMany({
      where: and(
        inArray(clubDiscussions.authorId, friendIds),
        gt(clubDiscussions.createdAt, cutoff),
      ),
      columns: {
        id: true,
        authorId: true,
        clubId: true,
        title: true,
        createdAt: true,
      },
      with: {
        club: { columns: { id: true, name: true, privacy: true } },
      },
      orderBy: [desc(clubDiscussions.createdAt)],
      limit: LIMIT_PER_TYPE * 2,
    }),
    db.query.prompts.findMany({
      where: and(
        inArray(prompts.creatorId, friendIds),
        or(eq(prompts.privacy, 'PUBLIC'), eq(prompts.privacy, 'FRIENDS')),
        gt(prompts.createdAt, cutoff),
      ),
      columns: { id: true, creatorId: true, title: true, createdAt: true },
      orderBy: [desc(prompts.createdAt)],
      limit: LIMIT_PER_TYPE,
    }),
    db.query.readingLists.findMany({
      where: and(
        inArray(readingLists.userId, friendIds),
        or(
          eq(readingLists.privacy, 'PUBLIC'),
          eq(readingLists.privacy, 'FRIENDS'),
        ),
        gt(readingLists.createdAt, cutoff),
      ),
      columns: { id: true, userId: true, title: true, createdAt: true },
      orderBy: [desc(readingLists.createdAt)],
      limit: LIMIT_PER_TYPE,
    }),
    db.query.hives.findMany({
      where: and(
        inArray(hives.ownerId, friendIds),
        or(eq(hives.privacy, 'PUBLIC'), eq(hives.privacy, 'FRIENDS')),
        gt(hives.createdAt, cutoff),
      ),
      columns: {
        id: true,
        ownerId: true,
        name: true,
        genre: true,
        createdAt: true,
      },
      orderBy: [desc(hives.createdAt)],
      limit: LIMIT_PER_TYPE,
    }),
  ]) : [[], [], [], [], [], [], [], []];

  const userMap = Object.fromEntries((friendUsers as { id: string; username: string | null; image: string | null }[]).map((u) => [u.id, u]));
  const events: FeedEvent[] = [];

  for (const b of recentBooks) {
    const user = userMap[b.userId];
    if (!user) continue;
    events.push({
      id: `book-${b.id}`,
      type: 'NEW_BOOK',
      timestamp: b.createdAt,
      user,
      meta: { title: b.title, genre: b.genre, bookId: b.id },
      link: `/library/${b.id}`,
    });
  }


  if (friendBookRows.length > 0) {
    const friendBookIds = friendBookRows.map((b) => b.id);
    const bookInfoMap = Object.fromEntries(
      friendBookRows.map((b) => [b.id, { title: b.title, userId: b.userId }]),
    );

    const recentChapters = await db.query.chapters.findMany({
      where: and(
        inArray(chapters.bookId, friendBookIds),
        gt(chapters.createdAt, cutoff),
      ),
      columns: { id: true, bookId: true, title: true, createdAt: true },
      orderBy: [desc(chapters.createdAt)],
      limit: LIMIT_PER_TYPE,
    });

    for (const ch of recentChapters) {
      const bookInfo = bookInfoMap[ch.bookId];
      if (!bookInfo) continue;
      const user = userMap[bookInfo.userId];
      if (!user) continue;
      events.push({
        id: `chapter-${ch.id}`,
        type: 'NEW_CHAPTER',
        timestamp: ch.createdAt,
        user,
        meta: {
          chapterTitle: ch.title,
          bookTitle: bookInfo.title,
          bookId: ch.bookId,
          chapterId: ch.id,
        },
        link: `/library/${ch.bookId}/${ch.id}`,
      });
    }
  }

  for (const c of recentClubs) {
    const user = userMap[c.ownerId];
    if (!user) continue;
    events.push({
      id: `club-${c.id}`,
      type: 'NEW_CLUB',
      timestamp: c.createdAt,
      user,
      meta: { clubName: c.name, clubId: c.id },
      link: `/clubs/${c.id}`,
    });
  }

  for (const d of recentDiscussions) {
    if (d.club.privacy === 'PRIVATE') continue;
    const user = userMap[d.authorId];
    if (!user) continue;
    events.push({
      id: `discussion-${d.id}`,
      type: 'CLUB_DISCUSSION',
      timestamp: d.createdAt,
      user,
      meta: {
        discussionTitle: d.title,
        clubName: d.club.name,
        clubId: d.clubId,
      },
      link: `/clubs/${d.clubId}`,
    });
  }

  for (const p of recentPrompts) {
    const user = userMap[p.creatorId];
    if (!user) continue;
    events.push({
      id: `prompt-${p.id}`,
      type: 'NEW_PROMPT',
      timestamp: p.createdAt,
      user,
      meta: { title: p.title, promptId: p.id },
      link: `/prompts/${p.id}`,
    });
  }

  for (const l of recentLists) {
    const user = userMap[l.userId];
    if (!user) continue;
    events.push({
      id: `list-${l.id}`,
      type: 'NEW_READING_LIST',
      timestamp: l.createdAt,
      user,
      meta: { title: l.title, listId: l.id },
      link: `/u/${user.username ?? user.id}`,
    });
  }

  for (const h of recentHives) {
    const user = userMap[h.ownerId];
    if (!user) continue;
    events.push({
      id: `hive-${h.id}`,
      type: 'NEW_HIVE',
      timestamp: h.createdAt,
      user,
      meta: { name: h.name, genre: h.genre, hiveId: h.id },
      link: `/hive/${h.id}`,
    });
  }

  if (followedListIdRows.length > 0) {
    const followedListBooks = await db.query.readingListBooks.findMany({
      where: and(
        inArray(readingListBooks.readingListId, followedListIdRows.map((f) => f.listId)),
        gt(readingListBooks.addedAt, cutoff),
      ),
      with: {
        readingList: {
          with: { user: { columns: { id: true, username: true, image: true } } },
        },
      },
      orderBy: [desc(readingListBooks.addedAt)],
      limit: 10,
    });
    for (const book of followedListBooks) {
      const u = book.readingList.user;
      events.push({
        id: `list-book-${book.id}`,
        type: 'LIST_NEW_BOOK',
        user: { id: u.id, username: u.username, image: u.image },
        timestamp: book.addedAt,
        meta: { listTitle: book.readingList.title, listId: book.readingListId, bookTitle: book.title },
        link: `/reading-lists/${book.readingListId}`,
      });
    }
  }

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return events;
}
