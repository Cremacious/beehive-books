'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { checkCreateLimit } from '@/lib/premium';
import { and, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { hives, hiveMembers, hiveInvites, hiveJoinRequests, books, users, friendships } from '@/db/schema';
import { hiveSchema } from '@/lib/validations/hive.schema';
import { insertNotification } from '@/lib/notifications';
import { MILESTONES } from '@/lib/milestones';
import type { MilestoneKey } from '@/lib/milestones';
import type {
  HiveFormData,
  HiveRole,
  ActionResult,
  HiveWithMembership,
  HiveMemberWithUser,
  PendingHiveInvite,
  PendingHiveJoinRequest,
  InvitableFriend,
} from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

async function requireHiveMod(hiveId: string) {
  const { userId, membership } = await requireHiveMember(hiveId);
  if (membership.role === 'CONTRIBUTOR' || membership.role === 'BETA_READER') {
    throw new Error('Insufficient permissions');
  }
  return { userId, membership };
}

async function requireHiveOwner(hiveId: string) {
  const userId = await requireAuth();
  const hive = await db.query.hives.findFirst({
    where: and(eq(hives.id, hiveId), eq(hives.ownerId, userId)),
  });
  if (!hive) throw new Error('Hive not found or unauthorized');
  return { userId, hive };
}

export async function createHiveAction(
  data: HiveFormData,
  invitedIds: string[] = [],
): Promise<ActionResult & { hiveId?: string }> {
  const userId = await requireAuth();
  const limitError = await checkCreateLimit(userId, 'hives');
  if (limitError) return { success: false, message: limitError };
  const parsed = hiveSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    let bookId: string | null = null;


    if (data.bookId) {
      const book = await db.query.books.findFirst({
        where: eq(books.id, data.bookId),
      });
      if (book) bookId = book.id;
    }
   
    else if (data.newBookTitle && data.newBookAuthor) {
      const [newBook] = await db
        .insert(books)
        .values({
          userId,
          title: data.newBookTitle.trim(),
          author: data.newBookAuthor.trim(),
          genre: parsed.data.genre || 'Fiction',
          category: 'NOVEL',
          description: parsed.data.description || parsed.data.name,
          privacy: parsed.data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        })
        .returning({ id: books.id });
      bookId = newBook.id;
    }

    const [hive] = await db
      .insert(hives)
      .values({ ownerId: userId, bookId, ...parsed.data })
      .returning({ id: hives.id });

    await db.insert(hiveMembers).values({
      hiveId: hive.id,
      userId,
      role: 'OWNER',
    });

    if (invitedIds.length > 0) {
      await db.insert(hiveInvites).values(
        invitedIds.map((friendId) => ({
          hiveId: hive.id,
          invitedUserId: friendId,
          invitedByUserId: userId,
          role: 'CONTRIBUTOR' as const,
          status: 'PENDING' as const,
        })),
      );
      for (const friendId of invitedIds) {
        void insertNotification({
          recipientId: friendId,
          actorId: userId,
          type: 'HIVE_INVITE_PENDING',
          link: `/hive`,
          metadata: { hiveId: hive.id, hiveName: parsed.data.name },
        });
      }
    }

    revalidatePath('/hive');
    return { success: true, message: 'Hive created!', hiveId: hive.id };
  } catch {
    return { success: false, message: 'Failed to create hive.' };
  }
}

export async function getHiveAction(hiveId: string): Promise<HiveWithMembership | null> {
  const userId = await requireAuth();

  const hive = await db.query.hives.findFirst({
    where: eq(hives.id, hiveId),
  });
  if (!hive) return null;

  let myRole: HiveRole | null = null;
  if (userId) {
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    myRole = (membership?.role as HiveRole) ?? null;
  }

  if (hive.privacy === 'PRIVATE' && !myRole) return null;

  if (hive.privacy === 'FRIENDS' && !myRole) {
    if (!userId) return null;
    const friendship = await db.query.friendships.findFirst({
      where: and(
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, hive.ownerId)),
          and(eq(friendships.requesterId, hive.ownerId), eq(friendships.addresseeId, userId)),
        ),
        eq(friendships.status, 'ACCEPTED'),
      ),
    });
    if (!friendship) return null;
  }

  if (hive.bookId) {
    const book = await db.query.books.findFirst({
      where: eq(books.id, hive.bookId),
      columns: { wordCount: true, chapterCount: true },
    });
    if (book) {
      return {
        ...hive,
        totalWordCount: book.wordCount,
        chapterCount: book.chapterCount,
        myRole,
        isMember: myRole !== null,
      };
    }
  }

  return { ...hive, myRole, isMember: myRole !== null };
}

export async function getAllUserHivesAction(): Promise<HiveWithMembership[]> {
  const userId = await requireAuth();

  const memberships = await db.query.hiveMembers.findMany({
    where: eq(hiveMembers.userId, userId),
    with: { hive: true },
    orderBy: (m, { desc }) => [desc(m.joinedAt)],
  });

  // Fetch word counts for hives that are linked to a book
  const bookIds = memberships
    .map((m) => m.hive.bookId)
    .filter((id): id is string => !!id);

  const bookWordCounts: Record<string, number> = {};
  if (bookIds.length > 0) {
    const bookRows = await db.query.books.findMany({
      where: inArray(books.id, bookIds),
      columns: { id: true, wordCount: true },
    });
    for (const b of bookRows) {
      bookWordCounts[b.id] = b.wordCount;
    }
  }

  return memberships.map((m) => ({
    ...m.hive,
    myRole: m.role as HiveRole,
    isMember: true,
    totalWordCount: m.hive.bookId ? (bookWordCounts[m.hive.bookId] ?? 0) : 0,
  }));
}

export async function searchHivesAction(query: string): Promise<HiveWithMembership[]> {
  const userId = await requireAuth();

  const queryFilter = query.trim()
    ? or(ilike(hives.name, `%${query}%`), ilike(hives.description, `%${query}%`))
    : undefined;

  const publicHivesPromise = db.query.hives.findMany({
    where: and(eq(hives.privacy, 'PUBLIC'), queryFilter),
    orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
    limit: 30,
  });

  if (!userId) {
    const allHives = await publicHivesPromise;
    return allHives.map((h) => ({ ...h, myRole: null, isMember: false }));
  }

  const friendshipRows = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, 'ACCEPTED'),
    ),
  });
  const friendIds = friendshipRows.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );

  const [publicHivesList, friendHives] = await Promise.all([
    publicHivesPromise,
    friendIds.length > 0
      ? db.query.hives.findMany({
          where: and(
            eq(hives.privacy, 'FRIENDS'),
            inArray(hives.ownerId, friendIds),
            queryFilter,
          ),
          orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
          limit: 30,
        })
      : Promise.resolve([]),
  ]);

  const allHives = [...publicHivesList, ...friendHives];
  if (allHives.length === 0) return [];

  const myMemberships = await db.query.hiveMembers.findMany({
    where: and(
      eq(hiveMembers.userId, userId),
      sql`${hiveMembers.hiveId} = ANY(${sql`ARRAY[${sql.join(allHives.map((h) => sql`${h.id}`), sql`, `)}]::text[]`})`,
    ),
  });

  const membershipMap = new Map(myMemberships.map((m) => [m.hiveId, m.role as HiveRole]));

  return allHives.map((h) => ({
    ...h,
    myRole: membershipMap.get(h.id) ?? null,
    isMember: membershipMap.has(h.id),
  }));
}

export async function updateHiveAction(hiveId: string, data: HiveFormData): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  const parsed = hiveSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    await db
      .update(hives)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Hive updated.' };
  } catch {
    return { success: false, message: 'Failed to update hive.' };
  }
}

export async function deleteHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  try {
    await db.delete(hives).where(eq(hives.id, hiveId));
    revalidatePath('/hive');
    return { success: true, message: 'Hive deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete hive.' };
  }
}

export async function joinHiveAction(hiveId: string): Promise<ActionResult> {
  return requestToJoinHiveAction(hiveId);
}

export async function requestToJoinHiveAction(hiveId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };
  if (hive.privacy === 'PRIVATE') return { success: false, message: 'This hive is invite-only.' };

  if (hive.privacy === 'FRIENDS') {
    const friendship = await db.query.friendships.findFirst({
      where: and(
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, hive.ownerId)),
          and(eq(friendships.requesterId, hive.ownerId), eq(friendships.addresseeId, userId)),
        ),
        eq(friendships.status, 'ACCEPTED'),
      ),
    });
    if (!friendship) return { success: false, message: 'This hive is for friends only.' };
  }

  const existing = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (existing) return { success: false, message: 'Already a member.' };

  try {
    const existingRequest = await db.query.hiveJoinRequests.findFirst({
      where: and(eq(hiveJoinRequests.hiveId, hiveId), eq(hiveJoinRequests.userId, userId)),
    });

    if (existingRequest?.status === 'PENDING') {
      return { success: false, message: 'You already have a pending join request.' };
    }

    if (existingRequest) {
      await db
        .update(hiveJoinRequests)
        .set({ status: 'PENDING', updatedAt: new Date() })
        .where(eq(hiveJoinRequests.id, existingRequest.id));
    } else {
      await db.insert(hiveJoinRequests).values({ hiveId, userId, status: 'PENDING' });
    }

    void insertNotification({
      recipientId: hive.ownerId,
      actorId: userId,
      type: 'HIVE_JOIN_REQUEST',
      link: `/hive/${hiveId}`,
      metadata: { hiveId, hiveName: hive.name },
    });

    revalidatePath(`/hive/${hiveId}`);
    return { success: true, message: 'Join request sent.' };
  } catch {
    return { success: false, message: 'Failed to send join request.' };
  }
}

export async function checkHiveJoinRequestStatusAction(
  hiveId: string,
): Promise<'pending' | 'none'> {
  const userId = await requireAuth();
  if (!userId) return 'none';
  const request = await db.query.hiveJoinRequests.findFirst({
    where: and(
      eq(hiveJoinRequests.hiveId, hiveId),
      eq(hiveJoinRequests.userId, userId),
      eq(hiveJoinRequests.status, 'PENDING'),
    ),
  });
  return request ? 'pending' : 'none';
}

export async function getPendingHiveJoinRequestsAction(
  hiveId: string,
): Promise<PendingHiveJoinRequest[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) return [];

  const requests = await db.query.hiveJoinRequests.findMany({
    where: and(eq(hiveJoinRequests.hiveId, hiveId), eq(hiveJoinRequests.status, 'PENDING')),
    with: { user: { columns: { id: true, username: true, image: true } } },
    orderBy: [desc(hiveJoinRequests.createdAt)],
  });

  return requests.map((r) => ({
    id: r.id,
    user: { id: r.user.id, username: r.user.username, image: r.user.image },
    createdAt: r.createdAt,
  }));
}

export async function approveHiveJoinRequestAction(requestId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const request = await db.query.hiveJoinRequests.findFirst({
    where: eq(hiveJoinRequests.id, requestId),
  });
  if (!request) return { success: false, message: 'Request not found.' };

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, request.hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  const alreadyMember = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, request.hiveId), eq(hiveMembers.userId, request.userId)),
  });

  try {
    await db
      .update(hiveJoinRequests)
      .set({ status: 'APPROVED', updatedAt: new Date() })
      .where(eq(hiveJoinRequests.id, requestId));

    if (!alreadyMember) {
      await db.insert(hiveMembers).values({ hiveId: request.hiveId, userId: request.userId, role: 'CONTRIBUTOR' });
      await db
        .update(hives)
        .set({ memberCount: sql`${hives.memberCount} + 1`, updatedAt: new Date() })
        .where(eq(hives.id, request.hiveId));
    }

    revalidatePath(`/hive/${request.hiveId}`);
    return { success: true, message: 'Request approved.' };
  } catch {
    return { success: false, message: 'Failed to approve request.' };
  }
}

export async function rejectHiveJoinRequestAction(requestId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const request = await db.query.hiveJoinRequests.findFirst({
    where: eq(hiveJoinRequests.id, requestId),
  });
  if (!request) return { success: false, message: 'Request not found.' };

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, request.hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    await db
      .update(hiveJoinRequests)
      .set({ status: 'REJECTED', updatedAt: new Date() })
      .where(eq(hiveJoinRequests.id, requestId));

    revalidatePath(`/hive/${request.hiveId}`);
    return { success: true, message: 'Request rejected.' };
  } catch {
    return { success: false, message: 'Failed to reject request.' };
  }
}

export async function leaveHiveAction(hiveId: string): Promise<ActionResult> {
  const userId = await requireAuth();

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };
  if (hive.ownerId === userId) {
    return { success: false, message: 'Owner cannot leave. Transfer ownership or delete the hive.' };
  }

  try {
    await db
      .delete(hiveMembers)
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)));
    await db
      .update(hives)
      .set({ memberCount: sql`GREATEST(${hives.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    revalidatePath(`/hive/${hiveId}`);
    revalidatePath('/hive');
    return { success: true, message: 'Left hive.' };
  } catch {
    return { success: false, message: 'Failed to leave hive.' };
  }
}

export async function inviteMemberAction(
  hiveId: string,
  targetUserId: string,
  role: Exclude<HiveRole, 'OWNER'> = 'CONTRIBUTOR',
): Promise<ActionResult> {
  const { userId } = await requireHiveMod(hiveId);

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };

  const existingMember = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)),
  });
  if (existingMember) return { success: false, message: 'User is already a member.' };

  try {
   
    const existingInvite = await db.query.hiveInvites.findFirst({
      where: and(eq(hiveInvites.hiveId, hiveId), eq(hiveInvites.invitedUserId, targetUserId)),
    });

    if (existingInvite?.status === 'PENDING') {
      return { success: false, message: 'User already has a pending invite.' };
    }

    if (existingInvite) {
      await db
        .update(hiveInvites)
        .set({ status: 'PENDING', role, invitedByUserId: userId, updatedAt: new Date() })
        .where(eq(hiveInvites.id, existingInvite.id));
    } else {
      await db.insert(hiveInvites).values({
        hiveId,
        invitedUserId: targetUserId,
        invitedByUserId: userId,
        role,
      });
    }

    const actor = await db.query.users.findFirst({ where: eq(users.id, userId) });
    void insertNotification({
      recipientId: targetUserId,
      actorId: userId,
      type: 'HIVE_INVITE_PENDING',
      link: '/hive',
      metadata: { actorUsername: actor?.username ?? '', hiveName: hive.name, hiveId },
    });

    revalidatePath('/hive');
    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Invite sent.' };
  } catch {
    return { success: false, message: 'Failed to send invite.' };
  }
}

export async function acceptHiveInviteAction(
  inviteId: string,
): Promise<ActionResult & { hiveId?: string }> {
  try {
    const userId = await requireAuth();
    if (!userId) return { success: false, message: 'Unauthorized.' };

    const invite = await db.query.hiveInvites.findFirst({
      where: and(
        eq(hiveInvites.id, inviteId),
        eq(hiveInvites.invitedUserId, userId),
        eq(hiveInvites.status, 'PENDING'),
      ),
      with: { hive: { columns: { id: true, name: true, ownerId: true } } },
    });
    if (!invite) return { success: false, message: 'Invite not found or already handled.' };

    const alreadyMember = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, invite.hiveId), eq(hiveMembers.userId, userId)),
    });
    if (alreadyMember) {
      await db
        .update(hiveInvites)
        .set({ status: 'ACCEPTED', updatedAt: new Date() })
        .where(eq(hiveInvites.id, inviteId));
      return { success: true, message: 'Already a member.', hiveId: invite.hiveId };
    }

    await db
      .update(hiveInvites)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(hiveInvites.id, inviteId));

    await db.insert(hiveMembers).values({
      hiveId: invite.hiveId,
      userId,
      role: invite.role as HiveRole,
    });

    await db
      .update(hives)
      .set({ memberCount: sql`${hives.memberCount} + 1`, updatedAt: new Date() })
      .where(eq(hives.id, invite.hiveId));

    const actor = await db.query.users.findFirst({ where: eq(users.id, userId) });
    void insertNotification({
      recipientId: invite.hive.ownerId,
      actorId: userId,
      type: 'HIVE_INVITE',
      link: `/hive/${invite.hiveId}/members`,
      metadata: {
        actorUsername: actor?.username ?? '',
        hiveName: invite.hive.name,
        hiveId: invite.hiveId,
      },
    });

    revalidatePath('/hive');
    revalidatePath(`/hive/${invite.hiveId}`);
    revalidatePath(`/hive/${invite.hiveId}/members`);
    return { success: true, message: 'Invite accepted.', hiveId: invite.hiveId };
  } catch {
    return { success: false, message: 'Failed to accept invite.' };
  }
}

export async function declineHiveInviteAction(
  inviteId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();
    if (!userId) return { success: false, message: 'Unauthorized.' };

    const invite = await db.query.hiveInvites.findFirst({
      where: and(
        eq(hiveInvites.id, inviteId),
        eq(hiveInvites.invitedUserId, userId),
        eq(hiveInvites.status, 'PENDING'),
      ),
    });
    if (!invite) return { success: false, message: 'Invite not found.' };

    await db
      .update(hiveInvites)
      .set({ status: 'DECLINED', updatedAt: new Date() })
      .where(eq(hiveInvites.id, inviteId));

    revalidatePath('/hive');
    return { success: true, message: 'Invite declined.' };
  } catch {
    return { success: false, message: 'Failed to decline invite.' };
  }
}

export async function getPendingHiveInvitesAction(): Promise<PendingHiveInvite[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const invites = await db.query.hiveInvites.findMany({
    where: and(
      eq(hiveInvites.invitedUserId, userId),
      eq(hiveInvites.status, 'PENDING'),
    ),
    with: {
      hive: { columns: { id: true, name: true, coverUrl: true } },
      invitedBy: { columns: { username: true, image: true } },
    },
    orderBy: [desc(hiveInvites.createdAt)],
  });

  return invites.map((inv) => ({
    id: inv.id,
    hiveId: inv.hiveId,
    hiveName: inv.hive.name,
    hiveCoverUrl: inv.hive.coverUrl,
    role: inv.role as Exclude<HiveRole, 'OWNER'>,
    invitedBy: {
      username: inv.invitedBy.username,
      image: inv.invitedBy.image,
    },
    createdAt: inv.createdAt,
  }));
}

export async function getHivePendingInvitedFriendsAction(
  hiveId: string,
): Promise<InvitableFriend[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return [];
  }

  const friendRows = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, 'ACCEPTED'),
    ),
    columns: { requesterId: true, addresseeId: true },
  });
  const friendIds = new Set(
    friendRows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId)),
  );
  if (friendIds.size === 0) return [];

  const pendingInvites = await db.query.hiveInvites.findMany({
    where: and(eq(hiveInvites.hiveId, hiveId), eq(hiveInvites.status, 'PENDING')),
    columns: { invitedUserId: true },
  });
  const pendingFriendIds = pendingInvites
    .map((i) => i.invitedUserId)
    .filter((id) => friendIds.has(id));

  if (pendingFriendIds.length === 0) return [];

  const friendUsers = await db.query.users.findMany({
    where: inArray(users.id, pendingFriendIds),
    columns: { id: true, username: true, image: true },
  });

  return friendUsers.map((u) => ({ id: u.id, username: u.username, image: u.image }));
}

export async function getHiveFriendsForInviteAction(
  hiveId: string,
): Promise<InvitableFriend[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return [];
  }


  const friendRows = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, 'ACCEPTED'),
    ),
    columns: { requesterId: true, addresseeId: true },
  });
  const friendIds = friendRows.map((r) =>
    r.requesterId === userId ? r.addresseeId : r.requesterId,
  );
  if (friendIds.length === 0) return [];


  const members = await db.query.hiveMembers.findMany({
    where: eq(hiveMembers.hiveId, hiveId),
    columns: { userId: true },
  });
  const memberIds = new Set(members.map((m) => m.userId));


  const pendingInvites = await db.query.hiveInvites.findMany({
    where: and(eq(hiveInvites.hiveId, hiveId), eq(hiveInvites.status, 'PENDING')),
    columns: { invitedUserId: true },
  });
  const pendingIds = new Set(pendingInvites.map((i) => i.invitedUserId));

 
  const invitableFriendIds = friendIds.filter(
    (id) => !memberIds.has(id) && !pendingIds.has(id),
  );
  if (invitableFriendIds.length === 0) return [];

  const friendUsers = await db.query.users.findMany({
    where: inArray(users.id, invitableFriendIds),
    columns: { id: true, username: true, image: true },
  });

  return friendUsers.map((u) => ({
    id: u.id,
    username: u.username,
    image: u.image,
  }));
}

export async function removeMemberFromHiveAction(
  hiveId: string,
  targetUserId: string,
): Promise<ActionResult> {
  const { userId } = await requireHiveMod(hiveId);

  if (targetUserId === userId) return { success: false, message: 'Cannot remove yourself.' };

  const targetMembership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)),
  });
  if (!targetMembership) return { success: false, message: 'Member not found.' };
  if (targetMembership.role === 'OWNER') return { success: false, message: 'Cannot remove the owner.' };

  const myMembership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (myMembership?.role === 'MODERATOR' && targetMembership.role === 'MODERATOR') {
    return { success: false, message: 'Moderators cannot remove other moderators.' };
  }

  try {
    await db
      .delete(hiveMembers)
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)));
    await db
      .update(hives)
      .set({ memberCount: sql`GREATEST(${hives.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Member removed.' };
  } catch {
    return { success: false, message: 'Failed to remove member.' };
  }
}

export async function updateMemberRoleAction(
  hiveId: string,
  targetUserId: string,
  role: Exclude<HiveRole, 'OWNER'>,
): Promise<ActionResult> {
  await requireHiveOwner(hiveId);

  try {
    await db
      .update(hiveMembers)
      .set({ role })
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)));
    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Role updated.' };
  } catch {
    return { success: false, message: 'Failed to update role.' };
  }
}

export async function getHiveMembersAction(hiveId: string): Promise<HiveMemberWithUser[]> {
  const userId = await requireAuth();

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return [];

  if (hive.privacy === 'PRIVATE') {
    if (!userId) return [];
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return [];
  }

  const members = await db.query.hiveMembers.findMany({
    where: eq(hiveMembers.hiveId, hiveId),
    with: { user: true },
    orderBy: [
      sql`CASE ${hiveMembers.role} WHEN 'OWNER' THEN 0 WHEN 'MODERATOR' THEN 1 WHEN 'CONTRIBUTOR' THEN 2 ELSE 3 END`,
      hiveMembers.joinedAt,
    ],
  });

  return members as HiveMemberWithUser[];
}

export async function linkBookToHiveAction(
  hiveId: string,
  bookId: string,
): Promise<ActionResult> {
  const { userId } = await requireHiveOwner(hiveId);

  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId)),
  });
  if (!book) return { success: false, message: 'Book not found in your library.' };

  try {
    await db
      .update(hives)
      .set({ bookId, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Book linked to hive.' };
  } catch {
    return { success: false, message: 'Failed to link book.' };
  }
}

export async function unlinkBookFromHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);

  try {
    await db
      .update(hives)
      .set({ bookId: null, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Book unlinked.' };
  } catch {
    return { success: false, message: 'Failed to unlink book.' };
  }
}

export async function createAndLinkBookAction(
  hiveId: string,
  title: string,
  author: string,
): Promise<ActionResult> {
  const { userId, hive } = await requireHiveOwner(hiveId);

  if (!title.trim() || !author.trim()) {
    return { success: false, message: 'Book title and author are required.' };
  }

  try {
    const [newBook] = await db
      .insert(books)
      .values({
        userId,
        title: title.trim(),
        author: author.trim(),
        genre: hive.genre || 'Fiction',
        category: 'NOVEL',
        description: hive.description || hive.name,
        privacy: hive.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      })
      .returning({ id: books.id });

    await db
      .update(hives)
      .set({ bookId: newBook.id, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    revalidatePath('/library');
    return { success: true, message: 'Book created and linked.' };
  } catch {
    return { success: false, message: 'Failed to create book.' };
  }
}

export async function completeHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  try {
    await db
      .update(hives)
      .set({ status: 'COMPLETED', updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath('/hive');
    return { success: true, message: 'Hive marked as complete!' };
  } catch {
    return { success: false, message: 'Failed to complete hive.' };
  }
}

export type HiveMilestoneEntry = {
  key: MilestoneKey;
  label: string;
  description: string;
  achievedAt: string;
  member: { username: string | null; image: string | null };
};

export async function getHiveMilestonesAction(hiveId: string): Promise<HiveMilestoneEntry[]> {
  await requireHiveMember(hiveId);

  const hive = await db.query.hives.findFirst({
    where: eq(hives.id, hiveId),
    columns: { bookId: true },
  });
  if (!hive?.bookId) return [];

  const book = await db.query.books.findFirst({
    where: eq(books.id, hive.bookId),
    columns: { milestones: true, userId: true },
  });
  if (!book) return [];

  const owner = await db.query.users.findFirst({
    where: eq(users.id, book.userId),
    columns: { username: true, image: true },
  });

  const raw = (book.milestones ?? []) as { key: string; achievedAt: string }[];
  const milestoneMap = new Map(MILESTONES.map((m) => [m.key, m]));

  return raw
    .filter((r) => milestoneMap.has(r.key as MilestoneKey))
    .map((r) => {
      const meta = milestoneMap.get(r.key as MilestoneKey)!;
      return {
        key: r.key as MilestoneKey,
        label: meta.label,
        description: meta.description,
        achievedAt: r.achievedAt,
        member: { username: owner?.username ?? null, image: owner?.image ?? null },
      };
    })
    .sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime());
}
