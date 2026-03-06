'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  books,
  bookClubs,
  clubMembers,
  hives,
  hiveMembers,
  prompts,
  promptEntries,
  readingLists,
  friendships,
} from '@/db/schema';
import type { Book } from '@/lib/types/books.types';
import type { ClubWithMembership, ClubRole } from '@/lib/types/club.types';
import type { HiveWithMembership, HiveRole } from '@/lib/types/hive.types';
import type { PromptCard, PromptUser } from '@/lib/types/prompt.types';
import type { ReadingList } from '@/lib/types/reading-list.types';

const USER_COLUMNS = {
  clerkId: true,
  username: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
} as const;

async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, 'ACCEPTED'),
    ),
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

function mapBook(b: typeof books.$inferSelect): Book {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    category: b.category,
    description: b.description,
    privacy: b.privacy as Book['privacy'],
    explorable: b.explorable,
    draftStatus: b.draftStatus as Book['draftStatus'],
    wordCount: b.wordCount,
    commentCount: b.commentCount,
    chapterCount: b.chapterCount,
    coverUrl: b.coverUrl,
  };
}

// ─── Books ───────────────────────────────────────────────────────────────────

export async function searchExplorableBooksAction(
  query: string,
  genres: string[] = [],
  categories: string[] = [],
): Promise<Book[]> {
  const q = query.trim();
  const rows = await db.query.books.findMany({
    where: and(
      eq(books.explorable, true),
      eq(books.privacy, 'PUBLIC'),
      q ? or(ilike(books.title, `%${q}%`), ilike(books.author, `%${q}%`)) : undefined,
      genres.length > 0 ? inArray(books.genre, genres) : undefined,
      categories.length > 0 ? inArray(books.category, categories) : undefined,
    ),
    orderBy: [desc(books.createdAt)],
    limit: 30,
  });
  return rows.map(mapBook);
}

// ─── Clubs ───────────────────────────────────────────────────────────────────

export async function searchExplorableClubsAction(
  query: string,
  tags: string[] = [],
): Promise<ClubWithMembership[]> {
  const { userId } = await auth();
  const q = query.trim();

  const tagFilter =
    tags.length > 0
      ? or(...tags.map((t) => sql`${bookClubs.tags}::text ilike ${'%"' + t + '"%'}` as ReturnType<typeof sql>))
      : undefined;

  const queryFilter = q
    ? or(
        ilike(bookClubs.name, `%${q}%`),
        ilike(bookClubs.description, `%${q}%`),
        ilike(sql`${bookClubs.tags}::text`, `%${q}%`),
      )
    : undefined;

  const publicPromise = db.query.bookClubs.findMany({
    where: and(eq(bookClubs.explorable, true), eq(bookClubs.privacy, 'PUBLIC'), queryFilter, tagFilter),
    orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
    limit: 30,
  });

  if (!userId) {
    const clubs = await publicPromise;
    return clubs.map((c) => ({ ...c, tags: c.tags as string[], myRole: null, isMember: false }));
  }

  const friendIds = await getFriendIds(userId);
  const [publicClubs, friendClubs] = await Promise.all([
    publicPromise,
    friendIds.length > 0
      ? db.query.bookClubs.findMany({
          where: and(
            eq(bookClubs.explorable, true),
            eq(bookClubs.privacy, 'FRIENDS'),
            inArray(bookClubs.ownerId, friendIds),
            queryFilter,
            tagFilter,
          ),
          orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
          limit: 30,
        })
      : Promise.resolve([]),
  ]);

  const allClubs = [...publicClubs, ...friendClubs];
  if (allClubs.length === 0) return [];

  const myMemberships = await db.query.clubMembers.findMany({
    where: and(
      eq(clubMembers.userId, userId),
      inArray(
        clubMembers.clubId,
        allClubs.map((c) => c.id),
      ),
    ),
  });
  const memberMap = new Map(myMemberships.map((m) => [m.clubId, m.role as ClubRole]));

  return allClubs.map((c) => ({
    ...c,
    tags: c.tags as string[],
    myRole: memberMap.get(c.id) ?? null,
    isMember: memberMap.has(c.id),
  }));
}

// ─── Hives ───────────────────────────────────────────────────────────────────

export async function searchExplorableHivesAction(
  query: string,
  genres: string[] = [],
  tags: string[] = [],
): Promise<HiveWithMembership[]> {
  const { userId } = await auth();
  const q = query.trim();

  const tagFilter =
    tags.length > 0
      ? or(...tags.map((t) => sql`${hives.tags}::text ilike ${'%"' + t + '"%'}` as ReturnType<typeof sql>))
      : undefined;

  const queryFilter = q
    ? or(ilike(hives.name, `%${q}%`), ilike(hives.description, `%${q}%`), ilike(hives.genre, `%${q}%`))
    : undefined;

  const genreFilter = genres.length > 0 ? inArray(hives.genre, genres) : undefined;

  const publicPromise = db.query.hives.findMany({
    where: and(eq(hives.explorable, true), eq(hives.privacy, 'PUBLIC'), queryFilter, genreFilter, tagFilter),
    orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
    limit: 30,
  });

  if (!userId) {
    const allHives = await publicPromise;
    return allHives.map((h) => ({ ...h, tags: h.tags as string[], myRole: null, isMember: false }));
  }

  const friendIds = await getFriendIds(userId);
  const [publicHiveList, friendHives] = await Promise.all([
    publicPromise,
    friendIds.length > 0
      ? db.query.hives.findMany({
          where: and(
            eq(hives.explorable, true),
            eq(hives.privacy, 'FRIENDS'),
            inArray(hives.ownerId, friendIds),
            queryFilter,
            genreFilter,
            tagFilter,
          ),
          orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
          limit: 30,
        })
      : Promise.resolve([]),
  ]);

  const allHivesList = [...publicHiveList, ...friendHives];
  if (allHivesList.length === 0) return [];

  const myMemberships = await db.query.hiveMembers.findMany({
    where: and(
      eq(hiveMembers.userId, userId),
      inArray(
        hiveMembers.hiveId,
        allHivesList.map((h) => h.id),
      ),
    ),
  });
  const memberMap = new Map(myMemberships.map((m) => [m.hiveId, m.role as HiveRole]));

  return allHivesList.map((h) => ({
    ...h,
    tags: h.tags as string[],
    myRole: memberMap.get(h.id) ?? null,
    isMember: memberMap.has(h.id),
  }));
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

export async function searchExplorablePromptsAction(query: string): Promise<PromptCard[]> {
  const { userId } = await auth();
  const q = query.trim();

  const rows = await db.query.prompts.findMany({
    where: and(
      eq(prompts.explorable, true),
      eq(prompts.privacy, 'PUBLIC'),
      q ? or(ilike(prompts.title, `%${q}%`), ilike(prompts.description, `%${q}%`)) : undefined,
    ),
    with: { creator: { columns: USER_COLUMNS } },
    orderBy: [desc(prompts.createdAt)],
    limit: 30,
  });

  let myEntryMap = new Map<string, string>();
  if (userId && rows.length > 0) {
    const myEntries = await db.query.promptEntries.findMany({
      where: and(
        eq(promptEntries.userId, userId),
        inArray(
          promptEntries.promptId,
          rows.map((r) => r.id),
        ),
      ),
      columns: { id: true, promptId: true },
    });
    myEntryMap = new Map(myEntries.map((e) => [e.promptId, e.id]));
  }

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    endDate: p.endDate,
    privacy: p.privacy as 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
    explorable: p.explorable,
    status: (p.endDate < new Date() ? 'ENDED' : p.status) as 'ACTIVE' | 'ENDED',
    entryCount: p.entryCount,
    createdAt: p.createdAt,
    creator: p.creator as PromptUser,
    myInviteStatus: null,
    myEntryId: myEntryMap.get(p.id) ?? null,
  }));
}

// ─── Reading Lists ────────────────────────────────────────────────────────────

export async function searchExplorableReadingListsAction(query: string): Promise<ReadingList[]> {
  const q = query.trim();
  const rows = await db.query.readingLists.findMany({
    where: and(
      eq(readingLists.explorable, true),
      eq(readingLists.privacy, 'PUBLIC'),
      q ? ilike(readingLists.title, `%${q}%`) : undefined,
    ),
    orderBy: [desc(readingLists.updatedAt)],
    limit: 30,
  });
  return rows.map((r) => ({ ...r, privacy: r.privacy as ReadingList['privacy'] }));
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

export async function getExplorableHubDataAction(): Promise<{
  books: Book[];
  clubs: ClubWithMembership[];
  hives: HiveWithMembership[];
  prompts: PromptCard[];
  readingLists: ReadingList[];
}> {
  const [bookRows, clubRows, hiveRows, promptRows, readingListRows] = await Promise.all([
    db.query.books.findMany({
      where: and(eq(books.explorable, true), eq(books.privacy, 'PUBLIC')),
      orderBy: [desc(books.createdAt)],
      limit: 8,
    }),
    db.query.bookClubs.findMany({
      where: and(eq(bookClubs.explorable, true), eq(bookClubs.privacy, 'PUBLIC')),
      orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
      limit: 8,
    }),
    db.query.hives.findMany({
      where: and(eq(hives.explorable, true), eq(hives.privacy, 'PUBLIC')),
      orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
      limit: 8,
    }),
    db.query.prompts.findMany({
      where: and(eq(prompts.explorable, true), eq(prompts.privacy, 'PUBLIC')),
      with: { creator: { columns: USER_COLUMNS } },
      orderBy: [desc(prompts.createdAt)],
      limit: 8,
    }),
    db.query.readingLists.findMany({
      where: and(eq(readingLists.explorable, true), eq(readingLists.privacy, 'PUBLIC')),
      orderBy: [desc(readingLists.updatedAt)],
      limit: 8,
    }),
  ]);

  return {
    books: bookRows.map(mapBook),
    clubs: clubRows.map((c) => ({ ...c, tags: c.tags as string[], myRole: null, isMember: false })),
    hives: hiveRows.map((h) => ({ ...h, tags: h.tags as string[], myRole: null, isMember: false })),
    prompts: promptRows.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      endDate: p.endDate,
      privacy: p.privacy as 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
      explorable: p.explorable,
      status: (p.endDate < new Date() ? 'ENDED' : p.status) as 'ACTIVE' | 'ENDED',
      entryCount: p.entryCount,
      createdAt: p.createdAt,
      creator: p.creator as PromptUser,
      myInviteStatus: null,
      myEntryId: null,
    })),
    readingLists: readingListRows.map((r) => ({ ...r, privacy: r.privacy as ReadingList['privacy'] })),
  };
}
