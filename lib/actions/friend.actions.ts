'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, count, desc, eq, ilike, inArray, ne, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { bookClubs, books, clubMembers, friendships, hiveMembers, hives, notifications, prompts, users } from '@/db/schema';
import { insertNotification } from '@/lib/notifications';

type ActionResult = {
  success: boolean;
  message: string;
  friendshipId?: string;
};

export type FriendStatus =
  | { status: 'NONE' }
  | { status: 'PENDING_SENT'; friendshipId: string }
  | { status: 'PENDING_RECEIVED'; friendshipId: string }
  | { status: 'FRIENDS'; friendshipId: string };

async function findFriendship(a: string, b: string) {
  return db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)),
      and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a)),
    ),
  });
}

export async function getFriendshipStatusAction(
  targetUserId: string,
): Promise<FriendStatus> {
  const userId = await requireAuth();
  if (!userId || userId === targetUserId) return { status: 'NONE' };

  const f = await findFriendship(userId, targetUserId);
  if (!f) return { status: 'NONE' };

  if (f.status === 'ACCEPTED') return { status: 'FRIENDS', friendshipId: f.id };
  if (f.status === 'PENDING') {
    return f.requesterId === userId
      ? { status: 'PENDING_SENT', friendshipId: f.id }
      : { status: 'PENDING_RECEIVED', friendshipId: f.id };
  }
  return { status: 'NONE' };
}

export type FriendLatestBook = {
  id: string;
  title: string;
  coverUrl: string | null;
  genre: string;
};

export type FriendRecentPrompt = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'ENDED';
};

export type FriendActivity = {
  recentBooks: FriendLatestBook[];
  recentPrompts: FriendRecentPrompt[];
};

export type FriendUser = {
  id: string;
  username: string | null;
  image: string | null;
  bio?: string | null;
  bookCount?: number;
  latestBook?: FriendLatestBook | null;
  activity?: FriendActivity;
};

export async function getMyFriendsDataAction() {
  const userId = await requireAuth();

  const all = await db.query.friendships.findMany({
    where: or(
      eq(friendships.requesterId, userId),
      eq(friendships.addresseeId, userId),
    ),
    with: {
      requester: {
        columns: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
      addressee: {
        columns: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: (f, { desc }) => [desc(f.updatedAt)],
  });

  // Collect all friend user ids to batch-fetch book counts
  const friendIds = all
    .filter((f) => f.status === 'ACCEPTED')
    .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));

  const bookCountMap = new Map<string, number>();
  const latestBookMap = new Map<string, FriendLatestBook | null>();
  const activityMap = new Map<string, FriendActivity>();

  if (friendIds.length > 0) {
    await Promise.all(
      friendIds.map(async (id) => {
        const [countRow] = await db
          .select({ count: count() })
          .from(books)
          .where(and(eq(books.userId, id), eq(books.privacy, 'PUBLIC')));
        bookCountMap.set(id, countRow?.count ?? 0);

        const latest = await db.query.books.findFirst({
          where: and(eq(books.userId, id), eq(books.privacy, 'PUBLIC')),
          orderBy: (b, { desc }) => [desc(b.updatedAt)],
          columns: { id: true, title: true, coverUrl: true, genre: true },
        });
        latestBookMap.set(id, latest ?? null);

        const [recentBooks, recentPrompts] = await Promise.all([
          db.query.books.findMany({
            where: and(eq(books.userId, id), eq(books.privacy, 'PUBLIC')),
            orderBy: (b, { desc }) => [desc(b.updatedAt)],
            limit: 3,
            columns: { id: true, title: true, coverUrl: true, genre: true },
          }),
          db.query.prompts.findMany({
            where: and(eq(prompts.creatorId, id), eq(prompts.explorable, true)),
            orderBy: (p, { desc }) => [desc(p.createdAt)],
            limit: 2,
            columns: { id: true, title: true, status: true },
          }),
        ]);
        activityMap.set(id, { recentBooks, recentPrompts });
      }),
    );
  }

  const friends: Array<{ friendshipId: string; user: FriendUser }> = [];
  const receivedRequests: Array<{ friendshipId: string; user: FriendUser }> =
    [];
  const sentRequests: Array<{ friendshipId: string; user: FriendUser }> = [];

  for (const f of all) {
    const other = f.requesterId === userId ? f.addressee : f.requester;
    if (f.status === 'ACCEPTED') {
      friends.push({
        friendshipId: f.id,
        user: {
          ...other,
          bookCount: bookCountMap.get(other.id) ?? 0,
          latestBook: latestBookMap.get(other.id) ?? null,
          activity: activityMap.get(other.id) ?? { recentBooks: [], recentPrompts: [] },
        },
      });
    } else if (f.status === 'PENDING') {
      if (f.addresseeId === userId)
        receivedRequests.push({ friendshipId: f.id, user: other });
      else sentRequests.push({ friendshipId: f.id, user: other });
    }
  }

  return { friends, receivedRequests, sentRequests };
}

export type SearchResult = {
  user: FriendUser & { email: string };
  friendStatus: FriendStatus;
};

export async function searchUsersAction(
  query: string,
): Promise<SearchResult[]> {
  const userId = await requireAuth();
  if (!userId || query.trim().length < 2) return [];

  const like = `%${query.trim()}%`;

  const results = await db.query.users.findMany({
    where: and(
      ne(users.id, userId),
      or(ilike(users.username, like), ilike(users.email, like)),
    ),
    columns: {
      id: true,
      username: true,
      image: true,
      email: true,
    },
    limit: 15,
  });

  const myFriendships = await db.query.friendships.findMany({
    where: or(
      eq(friendships.requesterId, userId),
      eq(friendships.addresseeId, userId),
    ),
  });

  return results.map((u) => {
    const f = myFriendships.find(
      (row) =>
        (row.requesterId === userId && row.addresseeId === u.id) ||
        (row.requesterId === u.id && row.addresseeId === userId),
    );

    let friendStatus: FriendStatus = { status: 'NONE' };
    if (f) {
      if (f.status === 'ACCEPTED') {
        friendStatus = { status: 'FRIENDS', friendshipId: f.id };
      } else if (f.status === 'PENDING') {
        friendStatus =
          f.requesterId === userId
            ? { status: 'PENDING_SENT', friendshipId: f.id }
            : { status: 'PENDING_RECEIVED', friendshipId: f.id };
      }
    }

    return { user: u, friendStatus };
  });
}

export async function sendFriendRequestAction(
  addresseeId: string,
): Promise<ActionResult> {
  const requesterId = await requireAuth();
  if (requesterId === addresseeId)
    return { success: false, message: "You can't add yourself." };

  const existing = await findFriendship(requesterId, addresseeId);
  if (existing) {
    if (existing.status === 'ACCEPTED')
      return { success: false, message: 'Already friends.' };
    if (existing.status === 'PENDING')
      return { success: false, message: 'Request already pending.' };
  }

  try {
    const [row] = await db
      .insert(friendships)
      .values({ requesterId, addresseeId })
      .returning({ id: friendships.id });
    const actor = await db.query.users.findFirst({
      where: eq(users.id, requesterId),
      columns: { username: true },
    });
    void insertNotification({
      recipientId: addresseeId,
      actorId: requesterId,
      type: 'FRIEND_REQUEST',
      link: '/friends',
      metadata: { actorUsername: actor?.username ?? '' },
    });
    revalidatePath('/friends');
    return {
      success: true,
      message: 'Friend request sent.',
      friendshipId: row.id,
    };
  } catch {
    return { success: false, message: 'Failed to send request.' };
  }
}

export async function cancelFriendRequestAction(
  friendshipId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.id, friendshipId),
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'PENDING'),
    ),
  });
  if (!row) return { success: false, message: 'Request not found.' };

  try {
    await db.delete(friendships).where(eq(friendships.id, friendshipId));

    void db
      .delete(notifications)
      .where(
        and(
          eq(notifications.recipientId, row.addresseeId),
          eq(notifications.actorId, userId),
          eq(notifications.type, 'FRIEND_REQUEST'),
        ),
      );
    revalidatePath('/friends');
    return { success: true, message: 'Request cancelled.' };
  } catch {
    return { success: false, message: 'Failed to cancel request.' };
  }
}

export async function acceptFriendRequestAction(
  friendshipId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'PENDING'),
    ),
  });
  if (!row) return { success: false, message: 'Request not found.' };

  try {
    await db
      .update(friendships)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId));
    const actor = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { username: true },
    });
    void insertNotification({
      recipientId: row.requesterId,
      actorId: userId,
      type: 'FRIEND_ACCEPTED',
      link: '/friends',
      metadata: { actorUsername: actor?.username ?? '' },
    });
    revalidatePath('/friends');
    return { success: true, message: 'Friend request accepted.' };
  } catch {
    return { success: false, message: 'Failed to accept request.' };
  }
}

export async function rejectFriendRequestAction(
  friendshipId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'PENDING'),
    ),
  });
  if (!row) return { success: false, message: 'Request not found.' };

  try {
    await db.delete(friendships).where(eq(friendships.id, friendshipId));
    revalidatePath('/friends');
    return { success: true, message: 'Request declined.' };
  } catch {
    return { success: false, message: 'Failed to decline request.' };
  }
}

export async function removeFriendAction(
  friendshipId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.id, friendshipId),
      eq(friendships.status, 'ACCEPTED'),
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
    ),
  });
  if (!row) return { success: false, message: 'Friendship not found.' };

  try {
    await db.delete(friendships).where(eq(friendships.id, friendshipId));
    revalidatePath('/friends');
    return { success: true, message: 'Friend removed.' };
  } catch {
    return { success: false, message: 'Failed to remove friend.' };
  }
}

export type SuggestedUser = {
  id: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  bookCount: number;
  latestBook: FriendLatestBook | null;
  activity: FriendActivity;
  friendStatus: FriendStatus;
  mutualContext?: string;
};

export async function getSuggestedUsersAction(): Promise<SuggestedUser[]> {
  const userId = await requireAuth();

  const myFriendships = await db.query.friendships.findMany({
    where: or(
      eq(friendships.requesterId, userId),
      eq(friendships.addresseeId, userId),
    ),
  });
  const connectedIds = new Set<string>(
    myFriendships.flatMap((f) => [f.requesterId, f.addresseeId]),
  );
  connectedIds.add(userId);

  // contextMap preserves insertion order: club/hive matches first, then genre, then fallback
  const contextMap = new Map<string, string>();

  // Priority 1 — shared club members
  const myClubRows = await db
    .select({ clubId: clubMembers.clubId })
    .from(clubMembers)
    .where(eq(clubMembers.userId, userId));
  const myClubIds = myClubRows.map((r) => r.clubId);

  if (myClubIds.length > 0) {
    const sharedClubRows = await db
      .select({ userId: clubMembers.userId, clubName: bookClubs.name })
      .from(clubMembers)
      .innerJoin(bookClubs, eq(clubMembers.clubId, bookClubs.id))
      .where(
        and(inArray(clubMembers.clubId, myClubIds), ne(clubMembers.userId, userId)),
      );
    for (const row of sharedClubRows) {
      if (!connectedIds.has(row.userId) && !contextMap.has(row.userId)) {
        contextMap.set(row.userId, `Both in ${row.clubName}`);
      }
    }
  }

  // Priority 2 — shared hive members
  const myHiveRows = await db
    .select({ hiveId: hiveMembers.hiveId })
    .from(hiveMembers)
    .where(eq(hiveMembers.userId, userId));
  const myHiveIds = myHiveRows.map((r) => r.hiveId);

  if (myHiveIds.length > 0) {
    const sharedHiveRows = await db
      .select({ userId: hiveMembers.userId, hiveName: hives.name })
      .from(hiveMembers)
      .innerJoin(hives, eq(hiveMembers.hiveId, hives.id))
      .where(
        and(inArray(hiveMembers.hiveId, myHiveIds), ne(hiveMembers.userId, userId)),
      );
    for (const row of sharedHiveRows) {
      if (!connectedIds.has(row.userId) && !contextMap.has(row.userId)) {
        contextMap.set(row.userId, `Both in ${row.hiveName}`);
      }
    }
  }

  // Priority 3 — same genres
  if (contextMap.size < 20) {
    const myGenreRows = await db
      .select({ genre: books.genre })
      .from(books)
      .where(and(eq(books.userId, userId), ne(books.genre, '')))
      .groupBy(books.genre);
    const myGenres = myGenreRows.map((r) => r.genre).filter(Boolean);

    if (myGenres.length > 0) {
      const genreRows = await db
        .select({ userId: books.userId, genre: books.genre })
        .from(books)
        .where(
          and(
            eq(books.privacy, 'PUBLIC'),
            ne(books.userId, userId),
            inArray(books.genre, myGenres),
          ),
        )
        .groupBy(books.userId, books.genre)
        .limit(40);
      for (const row of genreRows) {
        if (!connectedIds.has(row.userId) && !contextMap.has(row.userId)) {
          contextMap.set(row.userId, `Writes ${row.genre}`);
        }
      }
    }
  }

  // Priority 4 — fallback: any users with public books
  if (contextMap.size < 12) {
    const bookCountRows = await db
      .select({ userId: books.userId, bookCount: count() })
      .from(books)
      .where(eq(books.privacy, 'PUBLIC'))
      .groupBy(books.userId)
      .orderBy(desc(count()))
      .limit(40);
    for (const row of bookCountRows) {
      if (!connectedIds.has(row.userId) && !contextMap.has(row.userId)) {
        contextMap.set(row.userId, '');
        if (contextMap.size >= 30) break;
      }
    }
  }

  const candidateIds = Array.from(contextMap.keys()).slice(0, 12);
  if (candidateIds.length === 0) return [];

  const userRows = await db.query.users.findMany({
    where: (u, { inArray: inArr }) => inArr(u.id, candidateIds),
    columns: { id: true, username: true, image: true, bio: true },
  });

  const bookCountData = await db
    .select({ userId: books.userId, cnt: count() })
    .from(books)
    .where(and(eq(books.privacy, 'PUBLIC'), inArray(books.userId, candidateIds)))
    .groupBy(books.userId);
  const bookCountMap = new Map(bookCountData.map((r) => [r.userId, r.cnt]));

  const results = await Promise.all(
    userRows.map(async (u) => {
      const bookCount = bookCountMap.get(u.id) ?? 0;
      const latestBook = await db.query.books.findFirst({
        where: and(eq(books.userId, u.id), eq(books.privacy, 'PUBLIC')),
        orderBy: (b, { desc }) => [desc(b.updatedAt)],
        columns: { id: true, title: true, coverUrl: true, genre: true },
      });

      const f = myFriendships.find(
        (row) =>
          (row.requesterId === userId && row.addresseeId === u.id) ||
          (row.requesterId === u.id && row.addresseeId === userId),
      );
      const friendStatus: FriendStatus = f
        ? f.status === 'ACCEPTED'
          ? { status: 'FRIENDS', friendshipId: f.id }
          : f.requesterId === userId
            ? { status: 'PENDING_SENT', friendshipId: f.id }
            : { status: 'PENDING_RECEIVED', friendshipId: f.id }
        : { status: 'NONE' };

      const [recentBooks, recentPrompts] = await Promise.all([
        db.query.books.findMany({
          where: and(eq(books.userId, u.id), eq(books.privacy, 'PUBLIC')),
          orderBy: (b, { desc }) => [desc(b.updatedAt)],
          limit: 3,
          columns: { id: true, title: true, coverUrl: true, genre: true },
        }),
        db.query.prompts.findMany({
          where: and(eq(prompts.creatorId, u.id), eq(prompts.explorable, true)),
          orderBy: (p, { desc }) => [desc(p.createdAt)],
          limit: 2,
          columns: { id: true, title: true, status: true },
        }),
      ]);
      const activity: FriendActivity = { recentBooks, recentPrompts };

      const rawContext = contextMap.get(u.id);
      const mutualContext = rawContext ? rawContext : undefined;

      return { ...u, bookCount, latestBook: latestBook ?? null, activity, friendStatus, mutualContext };
    }),
  );

  // Return in contextMap priority order
  const orderedResults = candidateIds
    .map((id) => results.find((r) => r.id === id))
    .filter(Boolean) as SuggestedUser[];

  return orderedResults;
}
