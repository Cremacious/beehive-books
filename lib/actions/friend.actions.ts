'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, count, desc, eq, ilike, ne, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { books, friendships, users, notifications } from '@/db/schema';
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

export type FriendUser = {
  id: string;
  username: string | null;
  image: string | null;
  bio?: string | null;
  bookCount?: number;
  latestBook?: FriendLatestBook | null;
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
  friendStatus: FriendStatus;
};

export async function getSuggestedUsersAction(): Promise<SuggestedUser[]> {
  const userId = await requireAuth();

  // Get existing friendship ids to exclude
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

  // Find users with public books, not already connected
  const bookCounts = await db
    .select({
      userId: books.userId,
      count: count(),
    })
    .from(books)
    .where(eq(books.privacy, 'PUBLIC'))
    .groupBy(books.userId)
    .orderBy(desc(count()))
    .limit(30);

  const candidateIds = bookCounts
    .map((r) => r.userId)
    .filter((id) => !connectedIds.has(id))
    .slice(0, 12);

  if (candidateIds.length === 0) return [];

  const userRows = await db.query.users.findMany({
    where: (u, { inArray }) => inArray(u.id, candidateIds),
    columns: { id: true, username: true, image: true, bio: true },
  });

  const results = await Promise.all(
    userRows.map(async (u) => {
      const bookCount = bookCounts.find((b) => b.userId === u.id)?.count ?? 0;
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

      return { ...u, bookCount, latestBook: latestBook ?? null, friendStatus };
    }),
  );

  return results;
}
