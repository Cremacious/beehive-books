'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';
import { searchLimiter } from '@/lib/rate-limit';

import { unstable_cache } from 'next/cache';
import { and, desc, eq, ilike, inArray, lt, or, sql } from 'drizzle-orm';
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
  id: true,
  username: true,
  image: true,
} as const;


const getFriendIds = unstable_cache(
  async (userId: string): Promise<string[]> => {
    const rows = await db.query.friendships.findMany({
      where: and(
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        eq(friendships.status, 'ACCEPTED'),
      ),
    });
    return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
  },
  ['explore-friend-ids'],
  { revalidate: 60 },
);

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



const LIMIT = 30;

export async function searchExplorableBooksAction(
  query: string,
  genres: string[] = [],
  categories: string[] = [],
  cursor?: string,
): Promise<{ books: Book[]; nextCursor: string | null }> {
  const userId = await getOptionalUserId();
  const { success } = await searchLimiter.limit(userId ?? 'anon');
  if (!success) throw new Error('Too many requests. Please slow down.');

  const q = query.trim();
  const rows = await db.query.books.findMany({
    where: and(
      eq(books.explorable, true),
      eq(books.privacy, 'PUBLIC'),
      q ? or(ilike(books.title, `%${q}%`), ilike(books.author, `%${q}%`)) : undefined,
      genres.length > 0 ? inArray(books.genre, genres) : undefined,
      categories.length > 0 ? inArray(books.category, categories) : undefined,
      cursor ? lt(books.createdAt, new Date(cursor)) : undefined,
    ),
    orderBy: [desc(books.createdAt)],
    limit: LIMIT + 1,
  });

  const hasMore = rows.length > LIMIT;
  const items = hasMore ? rows.slice(0, LIMIT) : rows;
  return {
    books: items.map(mapBook),
    nextCursor: hasMore ? items[LIMIT - 1].createdAt.toISOString() : null,
  };
}



export async function searchExplorableClubsAction(
  query: string,
  tags: string[] = [],
  cursor?: string,
): Promise<{ clubs: ClubWithMembership[]; nextCursor: string | null }> {
  const userId = await requireAuth();
  const { success } = await searchLimiter.limit(userId ?? 'anon');
  if (!success) throw new Error('Too many requests. Please slow down.');

  const q = query.trim();
  const cursorFilter = cursor ? lt(bookClubs.createdAt, new Date(cursor)) : undefined;

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
    where: and(eq(bookClubs.explorable, true), eq(bookClubs.privacy, 'PUBLIC'), queryFilter, tagFilter, cursorFilter),
    orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
    limit: LIMIT + 1,
  });

  if (!userId) {
    const rows = await publicPromise;
    const hasMore = rows.length > LIMIT;
    const items = hasMore ? rows.slice(0, LIMIT) : rows;
    return {
      clubs: items.map((c) => ({ ...c, tags: c.tags as string[], myRole: null, isMember: false })),
      nextCursor: hasMore ? items[LIMIT - 1].createdAt.toISOString() : null,
    };
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
            cursorFilter,
          ),
          orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
          limit: LIMIT + 1,
        })
      : Promise.resolve([]),
  ]);

  // Deduplicate, sort by createdAt desc, slice to LIMIT+1
  const seen = new Set<string>();
  const combined = [...publicClubs, ...friendClubs]
    .filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const hasMore = combined.length > LIMIT;
  const allClubs = hasMore ? combined.slice(0, LIMIT) : combined;

  if (allClubs.length === 0) return { clubs: [], nextCursor: null };

  const myMemberships = await db.query.clubMembers.findMany({
    where: and(
      eq(clubMembers.userId, userId),
      inArray(clubMembers.clubId, allClubs.map((c) => c.id)),
    ),
  });
  const memberMap = new Map(myMemberships.map((m) => [m.clubId, m.role as ClubRole]));

  return {
    clubs: allClubs.map((c) => ({
      ...c,
      tags: c.tags as string[],
      myRole: memberMap.get(c.id) ?? null,
      isMember: memberMap.has(c.id),
    })),
    nextCursor: hasMore ? allClubs[LIMIT - 1].createdAt.toISOString() : null,
  };
}


export async function searchExplorableHivesAction(
  query: string,
  genres: string[] = [],
  tags: string[] = [],
  cursor?: string,
): Promise<{ hives: HiveWithMembership[]; nextCursor: string | null }> {
  const userId = await requireAuth();
  const { success } = await searchLimiter.limit(userId ?? 'anon');
  if (!success) throw new Error('Too many requests. Please slow down.');

  const q = query.trim();
  const cursorFilter = cursor ? lt(hives.createdAt, new Date(cursor)) : undefined;

  const tagFilter =
    tags.length > 0
      ? or(...tags.map((t) => sql`${hives.tags}::text ilike ${'%"' + t + '"%'}` as ReturnType<typeof sql>))
      : undefined;

  const queryFilter = q
    ? or(ilike(hives.name, `%${q}%`), ilike(hives.description, `%${q}%`), ilike(hives.genre, `%${q}%`))
    : undefined;

  const genreFilter = genres.length > 0 ? inArray(hives.genre, genres) : undefined;

  const publicPromise = db.query.hives.findMany({
    where: and(eq(hives.explorable, true), eq(hives.privacy, 'PUBLIC'), queryFilter, genreFilter, tagFilter, cursorFilter),
    orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
    limit: LIMIT + 1,
  });

  if (!userId) {
    const rows = await publicPromise;
    const hasMore = rows.length > LIMIT;
    const items = hasMore ? rows.slice(0, LIMIT) : rows;
    return {
      hives: items.map((h) => ({ ...h, tags: h.tags as string[], myRole: null, isMember: false })),
      nextCursor: hasMore ? items[LIMIT - 1].createdAt.toISOString() : null,
    };
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
            cursorFilter,
          ),
          orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
          limit: LIMIT + 1,
        })
      : Promise.resolve([]),
  ]);

  // Deduplicate, sort by createdAt desc, slice to LIMIT+1
  const seen = new Set<string>();
  const combined = [...publicHiveList, ...friendHives]
    .filter((h) => { if (seen.has(h.id)) return false; seen.add(h.id); return true; })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const hasMore = combined.length > LIMIT;
  const allHivesList = hasMore ? combined.slice(0, LIMIT) : combined;

  if (allHivesList.length === 0) return { hives: [], nextCursor: null };

  const myMemberships = await db.query.hiveMembers.findMany({
    where: and(
      eq(hiveMembers.userId, userId),
      inArray(hiveMembers.hiveId, allHivesList.map((h) => h.id)),
    ),
  });
  const memberMap = new Map(myMemberships.map((m) => [m.hiveId, m.role as HiveRole]));

  return {
    hives: allHivesList.map((h) => ({
      ...h,
      tags: h.tags as string[],
      myRole: memberMap.get(h.id) ?? null,
      isMember: memberMap.has(h.id),
    })),
    nextCursor: hasMore ? allHivesList[LIMIT - 1].createdAt.toISOString() : null,
  };
}



export async function searchExplorablePromptsAction(
  query: string,
  cursor?: string,
): Promise<{ prompts: PromptCard[]; nextCursor: string | null }> {
  const userId = await requireAuth();
  const { success } = await searchLimiter.limit(userId ?? 'anon');
  if (!success) throw new Error('Too many requests. Please slow down.');

  const q = query.trim();

  const rows = await db.query.prompts.findMany({
    where: and(
      eq(prompts.explorable, true),
      eq(prompts.privacy, 'PUBLIC'),
      q ? or(ilike(prompts.title, `%${q}%`), ilike(prompts.description, `%${q}%`)) : undefined,
      cursor ? lt(prompts.createdAt, new Date(cursor)) : undefined,
    ),
    with: { creator: { columns: USER_COLUMNS } },
    orderBy: [desc(prompts.createdAt)],
    limit: LIMIT + 1,
  });

  const hasMore = rows.length > LIMIT;
  const items = hasMore ? rows.slice(0, LIMIT) : rows;

  let myEntryMap = new Map<string, string>();
  if (userId && items.length > 0) {
    const myEntries = await db.query.promptEntries.findMany({
      where: and(
        eq(promptEntries.userId, userId),
        inArray(promptEntries.promptId, items.map((r) => r.id)),
      ),
      columns: { id: true, promptId: true },
    });
    myEntryMap = new Map(myEntries.map((e) => [e.promptId, e.id]));
  }

  return {
    prompts: items.map((p) => ({
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
    })),
    nextCursor: hasMore ? items[LIMIT - 1].createdAt.toISOString() : null,
  };
}


export async function searchExplorableReadingListsAction(
  query: string,
  cursor?: string,
): Promise<{ readingLists: ReadingList[]; nextCursor: string | null }> {
  const userId = await getOptionalUserId();
  const { success } = await searchLimiter.limit(userId ?? 'anon');
  if (!success) throw new Error('Too many requests. Please slow down.');

  const q = query.trim();
  const rows = await db.query.readingLists.findMany({
    where: and(
      eq(readingLists.explorable, true),
      eq(readingLists.privacy, 'PUBLIC'),
      q ? ilike(readingLists.title, `%${q}%`) : undefined,
      cursor ? lt(readingLists.updatedAt, new Date(cursor)) : undefined,
    ),
    orderBy: [desc(readingLists.updatedAt)],
    limit: LIMIT + 1,
  });

  const hasMore = rows.length > LIMIT;
  const items = hasMore ? rows.slice(0, LIMIT) : rows;
  return {
    readingLists: items.map((r) => ({ ...r, privacy: r.privacy as ReadingList['privacy'] })),
    nextCursor: hasMore ? items[LIMIT - 1].updatedAt.toISOString() : null,
  };
}


const getCachedHubData = unstable_cache(
  async () => {
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
  },
  ['explore-hub'],
  { revalidate: 300 },
);

export async function getExplorableHubDataAction(): Promise<{
  books: Book[];
  clubs: ClubWithMembership[];
  hives: HiveWithMembership[];
  prompts: PromptCard[];
  readingLists: ReadingList[];
}> {
  return getCachedHubData();
}
