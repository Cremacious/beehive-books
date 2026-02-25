'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, ilike, ne, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { friendships, users } from '@/db/schema';

type ActionResult = { success: boolean; message: string };

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

/* ─── Status type ───────────────────────────────────────────────────────────── */

export type FriendStatus =
  | { status: 'NONE' }
  | { status: 'PENDING_SENT';     friendshipId: string }
  | { status: 'PENDING_RECEIVED'; friendshipId: string }
  | { status: 'FRIENDS';          friendshipId: string };

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

/** Returns the friendship row (any status) between two users, regardless of direction. */
async function findFriendship(a: string, b: string) {
  return db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)),
      and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a)),
    ),
  });
}

/* ─── Read actions ──────────────────────────────────────────────────────────── */

export async function getFriendshipStatusAction(targetUserId: string): Promise<FriendStatus> {
  const { userId } = await auth();
  if (!userId || userId === targetUserId) return { status: 'NONE' };

  const f = await findFriendship(userId, targetUserId);
  if (!f) return { status: 'NONE' };

  if (f.status === 'ACCEPTED') return { status: 'FRIENDS', friendshipId: f.id };
  if (f.status === 'PENDING') {
    return f.requesterId === userId
      ? { status: 'PENDING_SENT',     friendshipId: f.id }
      : { status: 'PENDING_RECEIVED', friendshipId: f.id };
  }
  return { status: 'NONE' };
}

export type FriendUser = {
  clerkId:   string;
  username:  string | null;
  firstName: string | null;
  lastName:  string | null;
  imageUrl:  string | null;
};

export async function getMyFriendsDataAction() {
  const userId = await requireAuth();

  const all = await db.query.friendships.findMany({
    where: or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
    with: {
      requester: { columns: { clerkId: true, username: true, firstName: true, lastName: true, imageUrl: true } },
      addressee: { columns: { clerkId: true, username: true, firstName: true, lastName: true, imageUrl: true } },
    },
    orderBy: (f, { desc }) => [desc(f.updatedAt)],
  });

  const friends:          Array<{ friendshipId: string; user: FriendUser }> = [];
  const receivedRequests: Array<{ friendshipId: string; user: FriendUser }> = [];
  const sentRequests:     Array<{ friendshipId: string; user: FriendUser }> = [];

  for (const f of all) {
    const other = f.requesterId === userId ? f.addressee : f.requester;
    if (f.status === 'ACCEPTED') {
      friends.push({ friendshipId: f.id, user: other });
    } else if (f.status === 'PENDING') {
      if (f.addresseeId === userId) receivedRequests.push({ friendshipId: f.id, user: other });
      else                          sentRequests.push({ friendshipId: f.id, user: other });
    }
  }

  return { friends, receivedRequests, sentRequests };
}

export type SearchResult = {
  user:         FriendUser & { email: string };
  friendStatus: FriendStatus;
};

export async function searchUsersAction(query: string): Promise<SearchResult[]> {
  const { userId } = await auth();
  if (!userId || query.trim().length < 2) return [];

  const like = `%${query.trim()}%`;

  const results = await db.query.users.findMany({
    where: and(
      ne(users.clerkId, userId),
      or(ilike(users.username, like), ilike(users.email, like)),
    ),
    columns: { clerkId: true, username: true, firstName: true, lastName: true, imageUrl: true, email: true },
    limit: 15,
  });

  const myFriendships = await db.query.friendships.findMany({
    where: or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
  });

  return results.map((u) => {
    const f = myFriendships.find(
      (row) =>
        (row.requesterId === userId && row.addresseeId === u.clerkId) ||
        (row.requesterId === u.clerkId && row.addresseeId === userId),
    );

    let friendStatus: FriendStatus = { status: 'NONE' };
    if (f) {
      if (f.status === 'ACCEPTED') {
        friendStatus = { status: 'FRIENDS', friendshipId: f.id };
      } else if (f.status === 'PENDING') {
        friendStatus = f.requesterId === userId
          ? { status: 'PENDING_SENT',     friendshipId: f.id }
          : { status: 'PENDING_RECEIVED', friendshipId: f.id };
      }
    }

    return { user: u, friendStatus };
  });
}

/* ─── Mutation actions ──────────────────────────────────────────────────────── */

export async function sendFriendRequestAction(addresseeId: string): Promise<ActionResult> {
  const requesterId = await requireAuth();
  if (requesterId === addresseeId)
    return { success: false, message: "You can't add yourself." };

  const existing = await findFriendship(requesterId, addresseeId);
  if (existing) {
    if (existing.status === 'ACCEPTED') return { success: false, message: 'Already friends.' };
    if (existing.status === 'PENDING')  return { success: false, message: 'Request already pending.' };
  }

  try {
    await db.insert(friendships).values({ requesterId, addresseeId });
    revalidatePath('/friends');
    return { success: true, message: 'Friend request sent.' };
  } catch {
    return { success: false, message: 'Failed to send request.' };
  }
}

export async function cancelFriendRequestAction(friendshipId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(eq(friendships.id, friendshipId), eq(friendships.requesterId, userId), eq(friendships.status, 'PENDING')),
  });
  if (!row) return { success: false, message: 'Request not found.' };

  try {
    await db.delete(friendships).where(eq(friendships.id, friendshipId));
    revalidatePath('/friends');
    return { success: true, message: 'Request cancelled.' };
  } catch {
    return { success: false, message: 'Failed to cancel request.' };
  }
}

export async function acceptFriendRequestAction(friendshipId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, userId), eq(friendships.status, 'PENDING')),
  });
  if (!row) return { success: false, message: 'Request not found.' };

  try {
    await db.update(friendships)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId));
    revalidatePath('/friends');
    return { success: true, message: 'Friend request accepted.' };
  } catch {
    return { success: false, message: 'Failed to accept request.' };
  }
}

export async function rejectFriendRequestAction(friendshipId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, userId), eq(friendships.status, 'PENDING')),
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

export async function removeFriendAction(friendshipId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  const row = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.id, friendshipId),
      eq(friendships.status, 'ACCEPTED'),
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
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
