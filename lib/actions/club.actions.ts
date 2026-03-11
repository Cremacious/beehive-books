'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { checkCreateLimit } from '@/lib/premium';
import { and, desc, eq, ilike, inArray, max, ne, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  bookClubs,
  clubMembers,
  clubDiscussions,
  clubDiscussionLikes,
  clubDiscussionReplies,
  clubDiscussionReplyLikes,
  clubReadingListBooks,
  clubInvites,
  clubJoinRequests,
  friendships,
  users,
} from '@/db/schema';
import { clubSchema, clubDiscussionSchema, clubReplySchema } from '@/lib/validations/club.schema';
import { insertNotification } from '@/lib/notifications';
import type {
  ClubFormData,
  ClubDiscussionFormData,
  ClubRole,
  ActionResult,
  ClubWithMembership,
  ClubMemberWithUser,
  ClubDiscussionWithAuthor,
  ClubDiscussionFull,
  ClubDiscussionReplyWithAuthor,
  ClubReadingListBook,
  BookStatus,
  InvitableClubFriend,
  PendingClubInvite,
  PendingJoinRequest,
} from '@/lib/types/club.types';

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function requireClubMember(clubId: string) {
  const userId = await requireAuth();
  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this club');
  return { userId, membership };
}

async function requireClubMod(clubId: string) {
  const { userId, membership } = await requireClubMember(clubId);
  if (membership.role === 'MEMBER') throw new Error('Insufficient permissions');
  return { userId, membership };
}

async function requireClubOwner(clubId: string) {
  const userId = await requireAuth();
  const club = await db.query.bookClubs.findFirst({
    where: and(eq(bookClubs.id, clubId), eq(bookClubs.ownerId, userId)),
  });
  if (!club) throw new Error('Club not found or unauthorized');
  return { userId, club };
}

export async function createClubAction(
  data: ClubFormData,
  invitedIds: string[] = [],
): Promise<ActionResult & { clubId?: string }> {
  const userId = await requireAuth();
  const limitError = await checkCreateLimit(userId, 'clubs');
  if (limitError) return { success: false, message: limitError };
  const parsed = clubSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    const [club] = await db
      .insert(bookClubs)
      .values({ ownerId: userId, ...parsed.data })
      .returning({ id: bookClubs.id });

    await db.insert(clubMembers).values({
      clubId: club.id,
      userId,
      role: 'OWNER',
    });

    if (invitedIds.length > 0) {
      await db.insert(clubInvites).values(
        invitedIds.map((friendId) => ({
          clubId: club.id,
          invitedUserId: friendId,
          invitedByUserId: userId,
          status: 'PENDING' as const,
        })),
      );
      for (const friendId of invitedIds) {
        void insertNotification({
          recipientId: friendId,
          actorId: userId,
          type: 'CLUB_INVITE',
          link: `/clubs`,
          metadata: { clubId: club.id, clubName: parsed.data.name },
        });
      }
    }

    revalidatePath('/clubs');
    return { success: true, message: 'Club created!', clubId: club.id };
  } catch {
    return { success: false, message: 'Failed to create club.' };
  }
}

export async function getClubAction(clubId: string): Promise<ClubWithMembership | null> {
  const { userId } = await auth();

  const club = await db.query.bookClubs.findFirst({
    where: eq(bookClubs.id, clubId),
  });
  if (!club) return null;

  let myRole: ClubRole | null = null;
  if (userId) {
    const membership = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
    });
    myRole = (membership?.role as ClubRole) ?? null;
  }

  if (club.privacy === 'PRIVATE' && !myRole) return null;

  if (club.privacy === 'FRIENDS' && !myRole) {
    if (!userId) return null;
    const friendship = await db.query.friendships.findFirst({
      where: and(
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, club.ownerId)),
          and(eq(friendships.requesterId, club.ownerId), eq(friendships.addresseeId, userId)),
        ),
        eq(friendships.status, 'ACCEPTED'),
      ),
    });
    if (!friendship) return null;
  }

  return { ...club, myRole, isMember: myRole !== null };
}

export async function getAllUserClubsAction(): Promise<ClubWithMembership[]> {
  const userId = await requireAuth();

  const memberships = await db.query.clubMembers.findMany({
    where: eq(clubMembers.userId, userId),
    with: { club: true },
    orderBy: (m, { desc }) => [desc(m.joinedAt)],
  });

  return memberships.map((m) => ({
    ...m.club,
    myRole: m.role as ClubRole,
    isMember: true,
  }));
}

export async function searchClubsAction(query: string): Promise<ClubWithMembership[]> {
  const { userId } = await auth();

  const queryFilter = query.trim()
    ? or(ilike(bookClubs.name, `%${query}%`), ilike(bookClubs.description, `%${query}%`))
    : undefined;


  const publicClubsPromise = db.query.bookClubs.findMany({
    where: and(eq(bookClubs.privacy, 'PUBLIC'), queryFilter),
    orderBy: [desc(bookClubs.memberCount), desc(bookClubs.createdAt)],
    limit: 30,
  });

  if (!userId) {
    const clubs = await publicClubsPromise;
    return clubs.map((c) => ({ ...c, myRole: null, isMember: false }));
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

  const [publicClubs, friendClubs] = await Promise.all([
    publicClubsPromise,
    friendIds.length > 0
      ? db.query.bookClubs.findMany({
          where: and(
            eq(bookClubs.privacy, 'FRIENDS'),
            inArray(bookClubs.ownerId, friendIds),
            queryFilter,
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
      sql`${clubMembers.clubId} = ANY(${sql`ARRAY[${sql.join(allClubs.map((c) => sql`${c.id}`), sql`, `)}]::text[]`})`,
    ),
  });

  const membershipMap = new Map(myMemberships.map((m) => [m.clubId, m.role as ClubRole]));

  return allClubs.map((c) => ({
    ...c,
    myRole: membershipMap.get(c.id) ?? null,
    isMember: membershipMap.has(c.id),
  }));
}

export async function updateClubAction(clubId: string, data: ClubFormData): Promise<ActionResult> {
  await requireClubOwner(clubId);
  const parsed = clubSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    await db
      .update(bookClubs)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(bookClubs.id, clubId));
    revalidatePath(`/clubs/${clubId}`);
    revalidatePath(`/clubs/${clubId}/settings`);
    return { success: true, message: 'Club updated.' };
  } catch {
    return { success: false, message: 'Failed to update club.' };
  }
}

export async function deleteClubAction(clubId: string): Promise<ActionResult> {
  await requireClubOwner(clubId);
  try {
    await db.delete(bookClubs).where(eq(bookClubs.id, clubId));
    revalidatePath('/clubs');
    return { success: true, message: 'Club deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete club.' };
  }
}

export async function joinClubAction(clubId: string): Promise<ActionResult> {
  return requestToJoinClubAction(clubId);
}

export async function leaveClubAction(clubId: string): Promise<ActionResult> {
  const userId = await requireAuth();

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return { success: false, message: 'Club not found.' };
  if (club.ownerId === userId) return { success: false, message: 'Owner cannot leave. Transfer ownership or delete the club.' };

  try {
    await db
      .delete(clubMembers)
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)));
    await db
      .update(bookClubs)
      .set({ memberCount: sql`GREATEST(${bookClubs.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(bookClubs.id, clubId));

    revalidatePath(`/clubs/${clubId}`);
    revalidatePath('/clubs');
    return { success: true, message: 'Left club.' };
  } catch {
    return { success: false, message: 'Failed to leave club.' };
  }
}

export async function removeMemberAction(clubId: string, targetUserId: string): Promise<ActionResult> {
  const { userId } = await requireClubMod(clubId);

  if (targetUserId === userId) return { success: false, message: 'Cannot remove yourself.' };

  const targetMembership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, targetUserId)),
  });
  if (!targetMembership) return { success: false, message: 'Member not found.' };

  const myMembership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
  });
  if (myMembership?.role === 'MODERATOR' && targetMembership.role !== 'MEMBER') {
    return { success: false, message: 'Moderators cannot remove other moderators.' };
  }
  if (targetMembership.role === 'OWNER') {
    return { success: false, message: 'Cannot remove the owner.' };
  }

  try {
    await db
      .delete(clubMembers)
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, targetUserId)));
    await db
      .update(bookClubs)
      .set({ memberCount: sql`GREATEST(${bookClubs.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(bookClubs.id, clubId));
    revalidatePath(`/clubs/${clubId}/members`);
    return { success: true, message: 'Member removed.' };
  } catch {
    return { success: false, message: 'Failed to remove member.' };
  }
}

export async function updateMemberRoleAction(
  clubId: string,
  targetUserId: string,
  role: 'MODERATOR' | 'MEMBER',
): Promise<ActionResult> {
  await requireClubOwner(clubId);

  try {
    await db
      .update(clubMembers)
      .set({ role })
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, targetUserId)));
    revalidatePath(`/clubs/${clubId}/members`);
    return { success: true, message: role === 'MODERATOR' ? 'Promoted to moderator.' : 'Demoted to member.' };
  } catch {
    return { success: false, message: 'Failed to update role.' };
  }
}

export async function getClubMembersAction(clubId: string): Promise<ClubMemberWithUser[]> {
  const { userId } = await auth();

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return [];

  if (club.privacy !== 'PUBLIC') {
    if (!userId) return [];
    const membership = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
    });
    if (!membership) return [];
  }

  const members = await db.query.clubMembers.findMany({
    where: eq(clubMembers.clubId, clubId),
    with: { user: true },
    orderBy: [
      sql`CASE ${clubMembers.role} WHEN 'OWNER' THEN 0 WHEN 'MODERATOR' THEN 1 ELSE 2 END`,
      clubMembers.joinedAt,
    ],
  });

  return members as ClubMemberWithUser[];
}


export async function updateClubBookAction(
  clubId: string,
  currentBook: string,
  currentBookAuthor: string,
): Promise<ActionResult> {
  await requireClubMod(clubId);
  try {
    await db
      .update(bookClubs)
      .set({
        currentBook: currentBook.trim() || null,
        currentBookAuthor: currentBookAuthor.trim() || null,
        progressPercent: 0,
        currentPage: 0,
        totalPages: null,
        updatedAt: new Date(),
      })
      .where(eq(bookClubs.id, clubId));
    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Current book updated.' };
  } catch {
    return { success: false, message: 'Failed to update current book.' };
  }
}


export async function updateClubProgressAction(
  clubId: string,
  currentPage: number,
  totalPages: number,
): Promise<ActionResult> {
  await requireClubMember(clubId);

  const clampedTotal = Math.max(1, Math.round(totalPages));
  const clampedPage = Math.max(0, Math.min(clampedTotal, Math.round(currentPage)));
  const percent = Math.min(100, Math.round((clampedPage / clampedTotal) * 100));

  try {
    await db
      .update(bookClubs)
      .set({
        progressPercent: percent,
        currentPage: clampedPage,
        totalPages: clampedTotal,
        updatedAt: new Date(),
      })
      .where(eq(bookClubs.id, clubId));
    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Progress updated.' };
  } catch {
    return { success: false, message: 'Failed to update progress.' };
  }
}

export async function createClubDiscussionAction(
  clubId: string,
  data: ClubDiscussionFormData,
): Promise<ActionResult & { discussionId?: string }> {
  const { userId } = await requireClubMember(clubId);
  const parsed = clubDiscussionSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    const [discussion] = await db
      .insert(clubDiscussions)
      .values({ clubId, authorId: userId, ...parsed.data })
      .returning({ id: clubDiscussions.id });

    const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
    const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });

    const allMembers = await db.query.clubMembers.findMany({
      where: and(eq(clubMembers.clubId, clubId), ne(clubMembers.userId, userId)),
    });

    for (const member of allMembers) {
      void insertNotification({
        recipientId: member.userId,
        actorId: userId,
        type: 'CLUB_DISCUSSION',
        link: `/clubs/${clubId}/discussions/${discussion.id}`,
        metadata: {
          actorUsername: actor?.username ?? '',
          clubName: club?.name ?? '',
          clubId,
          discussionId: discussion.id,
          discussionTitle: parsed.data.title,
        },
      });
    }

    revalidatePath(`/clubs/${clubId}/discussions`);
    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Discussion created.', discussionId: discussion.id };
  } catch {
    return { success: false, message: 'Failed to create discussion.' };
  }
}

export async function getClubDiscussionsAction(
  clubId: string,
  page = 1,
): Promise<{ discussions: ClubDiscussionWithAuthor[]; total: number }> {
  const { userId } = await auth();
  const PAGE_SIZE = 20;

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return { discussions: [], total: 0 };

  if (club.privacy !== 'PUBLIC') {
    if (!userId) return { discussions: [], total: 0 };
    const membership = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
    });
    if (!membership) return { discussions: [], total: 0 };
  }

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(clubDiscussions)
      .where(eq(clubDiscussions.clubId, clubId)),
    db.query.clubDiscussions.findMany({
      where: eq(clubDiscussions.clubId, clubId),
      with: { author: true, likes: true },
      orderBy: [desc(clubDiscussions.isPinned), desc(clubDiscussions.updatedAt)],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const discussions: ClubDiscussionWithAuthor[] = rows.map((d) => ({
    ...d,
    likedByMe: userId ? d.likes.some((l) => l.userId === userId) : false,
  }));

  return { discussions, total: Number(countResult[0]?.count ?? 0) };
}

export async function getClubDiscussionByIdAction(
  clubId: string,
  discussionId: string,
): Promise<ClubDiscussionFull | null> {
  const { userId } = await auth();

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return null;

  if (club.privacy !== 'PUBLIC') {
    if (!userId) return null;
    const membership = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
    });
    if (!membership) return null;
  }

  const discussion = await db.query.clubDiscussions.findFirst({
    where: and(eq(clubDiscussions.id, discussionId), eq(clubDiscussions.clubId, clubId)),
    with: {
      author: true,
      likes: true,
      replies: {
        with: { author: true, likes: true, children: { with: { author: true, likes: true } } },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
      },
    },
  });

  if (!discussion) return null;

  const disc = discussion;
  type RawReply = (typeof disc.replies)[0];

  function mapReply(r: RawReply): ClubDiscussionReplyWithAuthor {
    return {
      ...r,
      likedByMe: userId ? r.likes.some((l) => l.userId === userId) : false,
      children: (r.children ?? []).map((child) => ({
        ...child,
        likedByMe: userId ? child.likes.some((l: { userId: string }) => l.userId === userId) : false,
        children: [],
      })),
    };
  }

  const topLevel = disc.replies.filter((r) => !r.parentId).map(mapReply);

  return {
    ...disc,
    likedByMe: userId ? disc.likes.some((l) => l.userId === userId) : false,
    replies: topLevel,
  };
}

export async function deleteClubDiscussionAction(
  clubId: string,
  discussionId: string,
): Promise<ActionResult> {
  const { userId, membership } = await requireClubMember(clubId);

  const discussion = await db.query.clubDiscussions.findFirst({
    where: and(eq(clubDiscussions.id, discussionId), eq(clubDiscussions.clubId, clubId)),
  });
  if (!discussion) return { success: false, message: 'Discussion not found.' };

  const canDelete = discussion.authorId === userId || membership.role !== 'MEMBER';
  if (!canDelete) return { success: false, message: 'Cannot delete this discussion.' };

  try {
    await db.delete(clubDiscussions).where(eq(clubDiscussions.id, discussionId));
    revalidatePath(`/clubs/${clubId}/discussions`);
    return { success: true, message: 'Discussion deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete discussion.' };
  }
}

export async function toggleDiscussionLikeAction(
  discussionId: string,
): Promise<{ success: boolean; liked: boolean }> {
  const userId = await requireAuth();

  const existing = await db.query.clubDiscussionLikes.findFirst({
    where: and(
      eq(clubDiscussionLikes.discussionId, discussionId),
      eq(clubDiscussionLikes.userId, userId),
    ),
  });

  try {
    if (existing) {
      await db
        .delete(clubDiscussionLikes)
        .where(
          and(
            eq(clubDiscussionLikes.discussionId, discussionId),
            eq(clubDiscussionLikes.userId, userId),
          ),
        );
      await db
        .update(clubDiscussions)
        .set({ likeCount: sql`GREATEST(${clubDiscussions.likeCount} - 1, 0)` })
        .where(eq(clubDiscussions.id, discussionId));
      return { success: true, liked: false };
    } else {
      await db.insert(clubDiscussionLikes).values({ discussionId, userId });
      await db
        .update(clubDiscussions)
        .set({ likeCount: sql`${clubDiscussions.likeCount} + 1` })
        .where(eq(clubDiscussions.id, discussionId));

      const discussion = await db.query.clubDiscussions.findFirst({
        where: eq(clubDiscussions.id, discussionId),
      });
      if (discussion && discussion.authorId !== userId) {
        const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
        void insertNotification({
          recipientId: discussion.authorId,
          actorId: userId,
          type: 'COMMENT_LIKE',
          link: `/clubs/${discussion.clubId}/discussions/${discussionId}`,
          metadata: { actorUsername: actor?.username ?? '', discussionId },
        });
      }

      return { success: true, liked: true };
    }
  } catch {
    return { success: false, liked: !!existing };
  }
}

export async function pinDiscussionAction(
  clubId: string,
  discussionId: string,
  pin: boolean,
): Promise<ActionResult> {
  await requireClubMod(clubId);
  try {
    await db
      .update(clubDiscussions)
      .set({ isPinned: pin })
      .where(and(eq(clubDiscussions.id, discussionId), eq(clubDiscussions.clubId, clubId)));
    revalidatePath(`/clubs/${clubId}/discussions`);
    return { success: true, message: pin ? 'Discussion pinned.' : 'Discussion unpinned.' };
  } catch {
    return { success: false, message: 'Failed to update pin.' };
  }
}

export async function createDiscussionReplyAction(
  clubId: string,
  discussionId: string,
  content: string,
  parentId?: string,
): Promise<ActionResult & { replyId?: string }> {
  const { userId } = await requireClubMember(clubId);
  const parsed = clubReplySchema.safeParse({ content });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const discussion = await db.query.clubDiscussions.findFirst({
    where: and(eq(clubDiscussions.id, discussionId), eq(clubDiscussions.clubId, clubId)),
  });
  if (!discussion) return { success: false, message: 'Discussion not found.' };

  try {
    const [reply] = await db
      .insert(clubDiscussionReplies)
      .values({ discussionId, authorId: userId, content: parsed.data.content, parentId: parentId ?? null })
      .returning({ id: clubDiscussionReplies.id });

    await db
      .update(clubDiscussions)
      .set({ replyCount: sql`${clubDiscussions.replyCount} + 1`, updatedAt: new Date() })
      .where(eq(clubDiscussions.id, discussionId));

    const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
    const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });

    if (discussion.authorId !== userId) {
      void insertNotification({
        recipientId: discussion.authorId,
        actorId: userId,
        type: 'CLUB_REPLY',
        link: `/clubs/${clubId}/discussions/${discussionId}`,
        metadata: {
          actorUsername: actor?.username ?? '',
          clubName: club?.name ?? '',
          clubId,
          discussionId,
          discussionTitle: discussion.title,
        },
      });
    }

    if (parentId) {
      const parentReply = await db.query.clubDiscussionReplies.findFirst({
        where: eq(clubDiscussionReplies.id, parentId),
      });
      if (parentReply && parentReply.authorId !== userId && parentReply.authorId !== discussion.authorId) {
        void insertNotification({
          recipientId: parentReply.authorId,
          actorId: userId,
          type: 'CLUB_REPLY',
          link: `/clubs/${clubId}/discussions/${discussionId}`,
          metadata: {
            actorUsername: actor?.username ?? '',
            clubName: club?.name ?? '',
            clubId,
            discussionId,
            discussionTitle: discussion.title,
          },
        });
      }
    }

    revalidatePath(`/clubs/${clubId}/discussions/${discussionId}`);
    return { success: true, message: 'Reply posted.', replyId: reply.id };
  } catch {
    return { success: false, message: 'Failed to post reply.' };
  }
}

export async function deleteDiscussionReplyAction(
  clubId: string,
  replyId: string,
): Promise<ActionResult> {
  const { userId, membership } = await requireClubMember(clubId);

  const reply = await db.query.clubDiscussionReplies.findFirst({
    where: eq(clubDiscussionReplies.id, replyId),
  });
  if (!reply) return { success: false, message: 'Reply not found.' };

  const canDelete = reply.authorId === userId || membership.role !== 'MEMBER';
  if (!canDelete) return { success: false, message: 'Cannot delete this reply.' };

  try {
    await db.delete(clubDiscussionReplies).where(eq(clubDiscussionReplies.id, replyId));
    await db
      .update(clubDiscussions)
      .set({ replyCount: sql`GREATEST(${clubDiscussions.replyCount} - 1, 0)` })
      .where(eq(clubDiscussions.id, reply.discussionId));
    revalidatePath(`/clubs/${clubId}/discussions/${reply.discussionId}`);
    return { success: true, message: 'Reply deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete reply.' };
  }
}

export async function toggleReplyLikeAction(
  replyId: string,
): Promise<{ success: boolean; liked: boolean }> {
  const userId = await requireAuth();

  const existing = await db.query.clubDiscussionReplyLikes.findFirst({
    where: and(
      eq(clubDiscussionReplyLikes.replyId, replyId),
      eq(clubDiscussionReplyLikes.userId, userId),
    ),
  });

  try {
    if (existing) {
      await db
        .delete(clubDiscussionReplyLikes)
        .where(
          and(
            eq(clubDiscussionReplyLikes.replyId, replyId),
            eq(clubDiscussionReplyLikes.userId, userId),
          ),
        );
      await db
        .update(clubDiscussionReplies)
        .set({ likeCount: sql`GREATEST(${clubDiscussionReplies.likeCount} - 1, 0)` })
        .where(eq(clubDiscussionReplies.id, replyId));
      return { success: true, liked: false };
    } else {
      await db.insert(clubDiscussionReplyLikes).values({ replyId, userId });
      await db
        .update(clubDiscussionReplies)
        .set({ likeCount: sql`${clubDiscussionReplies.likeCount} + 1` })
        .where(eq(clubDiscussionReplies.id, replyId));

      const reply = await db.query.clubDiscussionReplies.findFirst({
        where: eq(clubDiscussionReplies.id, replyId),
      });
      if (reply && reply.authorId !== userId) {
        const discussion = await db.query.clubDiscussions.findFirst({
          where: eq(clubDiscussions.id, reply.discussionId),
        });
        const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
        void insertNotification({
          recipientId: reply.authorId,
          actorId: userId,
          type: 'COMMENT_LIKE',
          link: `/clubs/${discussion?.clubId}/discussions/${reply.discussionId}`,
          metadata: { actorUsername: actor?.username ?? '', discussionId: reply.discussionId },
        });
      }

      return { success: true, liked: true };
    }
  } catch {
    return { success: false, liked: !!existing };
  }
}

export async function getClubReadingListAction(clubId: string): Promise<ClubReadingListBook[]> {
  const { userId } = await auth();

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return [];

  if (club.privacy !== 'PUBLIC') {
    if (!userId) return [];
    const membership = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
    });
    if (!membership) return [];
  }

  return db.query.clubReadingListBooks.findMany({
    where: eq(clubReadingListBooks.clubId, clubId),
    orderBy: [
      sql`CASE ${clubReadingListBooks.status} WHEN 'IN_PROGRESS' THEN 0 WHEN 'NOT_STARTED' THEN 1 ELSE 2 END`,
      clubReadingListBooks.order,
    ],
  });
}

export async function addBookToClubListAction(
  clubId: string,
  title: string,
  author: string,
): Promise<ActionResult> {
  await requireClubMember(clubId);

  if (!title.trim() || !author.trim()) return { success: false, message: 'Title and author required.' };

  try {
    const maxOrderResult = await db
      .select({ maxOrder: max(clubReadingListBooks.order) })
      .from(clubReadingListBooks)
      .where(eq(clubReadingListBooks.clubId, clubId));
    const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

    const { userId } = await auth();
    await db.insert(clubReadingListBooks).values({
      clubId,
      title: title.trim(),
      author: author.trim(),
      order: nextOrder,
      addedById: userId,
    });
    revalidatePath(`/clubs/${clubId}/reading-list`);
    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Book added.' };
  } catch {
    return { success: false, message: 'Failed to add book.' };
  }
}

export async function removeBookFromClubListAction(
  clubId: string,
  bookId: string,
): Promise<ActionResult> {
  await requireClubMod(clubId);
  try {
    await db
      .delete(clubReadingListBooks)
      .where(and(eq(clubReadingListBooks.id, bookId), eq(clubReadingListBooks.clubId, clubId)));
    revalidatePath(`/clubs/${clubId}/reading-list`);
    return { success: true, message: 'Book removed.' };
  } catch {
    return { success: false, message: 'Failed to remove book.' };
  }
}

export async function updateBookStatusAction(
  clubId: string,
  bookId: string,
  status: BookStatus,
): Promise<ActionResult> {
  await requireClubMod(clubId);
  try {
    if (status === 'IN_PROGRESS') {

      await db
        .update(clubReadingListBooks)
        .set({ status: 'NOT_STARTED' })
        .where(
          and(
            eq(clubReadingListBooks.clubId, clubId),
            eq(clubReadingListBooks.status, 'IN_PROGRESS'),
            ne(clubReadingListBooks.id, bookId),
          ),
        );


      const [book] = await db
        .select({ title: clubReadingListBooks.title, author: clubReadingListBooks.author })
        .from(clubReadingListBooks)
        .where(and(eq(clubReadingListBooks.id, bookId), eq(clubReadingListBooks.clubId, clubId)));

      if (book) {
        await db
          .update(bookClubs)
          .set({
            currentBook: book.title,
            currentBookAuthor: book.author,
            progressPercent: 0,
            currentPage: 0,
            totalPages: null,
            updatedAt: new Date(),
          })
          .where(eq(bookClubs.id, clubId));
      }
    }

    await db
      .update(clubReadingListBooks)
      .set({ status })
      .where(and(eq(clubReadingListBooks.id, bookId), eq(clubReadingListBooks.clubId, clubId)));

    revalidatePath(`/clubs/${clubId}/reading-list`);
    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Status updated.' };
  } catch {
    return { success: false, message: 'Failed to update status.' };
  }
}



export async function getClubFriendsForInviteAction(
  clubId: string,
): Promise<InvitableClubFriend[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
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

  const members = await db.query.clubMembers.findMany({
    where: eq(clubMembers.clubId, clubId),
    columns: { userId: true },
  });
  const memberIds = new Set(members.map((m) => m.userId));

  const pendingInvites = await db.query.clubInvites.findMany({
    where: and(eq(clubInvites.clubId, clubId), eq(clubInvites.status, 'PENDING')),
    columns: { invitedUserId: true },
  });
  const pendingIds = new Set(pendingInvites.map((i) => i.invitedUserId));

  const invitableFriendIds = friendIds.filter(
    (id) => !memberIds.has(id) && !pendingIds.has(id),
  );
  if (invitableFriendIds.length === 0) return [];

  const friendUsers = await db.query.users.findMany({
    where: inArray(users.clerkId, invitableFriendIds),
    columns: { clerkId: true, username: true, imageUrl: true },
  });

  return friendUsers.map((u) => ({
    clerkId: u.clerkId,
    username: u.username,
    imageUrl: u.imageUrl,
  }));
}

export async function inviteToClubAction(
  clubId: string,
  friendClerkId: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return { success: false, message: 'Only owners and moderators can invite members.' };
  }

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return { success: false, message: 'Club not found.' };

  const existingMember = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, friendClerkId)),
  });
  if (existingMember) return { success: false, message: 'User is already a member.' };

  try {
    const existingInvite = await db.query.clubInvites.findFirst({
      where: and(
        eq(clubInvites.clubId, clubId),
        eq(clubInvites.invitedUserId, friendClerkId),
      ),
    });

    if (existingInvite?.status === 'PENDING') {
      return { success: false, message: 'User already has a pending invite.' };
    }

    if (existingInvite) {
      await db
        .update(clubInvites)
        .set({ status: 'PENDING', invitedByUserId: userId, updatedAt: new Date() })
        .where(eq(clubInvites.id, existingInvite.id));
    } else {
      await db.insert(clubInvites).values({
        clubId,
        invitedUserId: friendClerkId,
        invitedByUserId: userId,
        status: 'PENDING',
      });
    }

    void insertNotification({
      recipientId: friendClerkId,
      actorId: userId,
      type: 'CLUB_INVITE',
      link: `/clubs`,
      metadata: { clubId, clubName: club.name },
    });

    return { success: true, message: 'Invite sent.' };
  } catch {
    return { success: false, message: 'Failed to send invite.' };
  }
}

export async function getPendingClubInvitesAction(): Promise<PendingClubInvite[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const invites = await db.query.clubInvites.findMany({
    where: and(
      eq(clubInvites.invitedUserId, userId),
      eq(clubInvites.status, 'PENDING'),
    ),
    with: {
      club: { columns: { id: true, name: true, coverUrl: true } },
      invitedBy: { columns: { username: true, imageUrl: true } },
    },
    orderBy: [desc(clubInvites.createdAt)],
  });

  return invites.map((inv) => ({
    id: inv.id,
    club: {
      id: inv.club.id,
      name: inv.club.name,
      imageUrl: inv.club.coverUrl,
    },
    invitedBy: {
      username: inv.invitedBy.username,
      imageUrl: inv.invitedBy.imageUrl,
    },
    createdAt: inv.createdAt,
  }));
}

export async function acceptClubInviteAction(
  inviteId: string,
): Promise<ActionResult & { clubId?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const invite = await db.query.clubInvites.findFirst({
    where: and(
      eq(clubInvites.id, inviteId),
      eq(clubInvites.invitedUserId, userId),
      eq(clubInvites.status, 'PENDING'),
    ),
  });
  if (!invite) return { success: false, message: 'Invite not found.' };

  try {
    await db
      .update(clubInvites)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(clubInvites.id, inviteId));

    const existing = await db.query.clubMembers.findFirst({
      where: and(eq(clubMembers.clubId, invite.clubId), eq(clubMembers.userId, userId)),
    });
    if (!existing) {
      await db.insert(clubMembers).values({ clubId: invite.clubId, userId, role: 'MEMBER' });
      await db
        .update(bookClubs)
        .set({ memberCount: sql`${bookClubs.memberCount} + 1`, updatedAt: new Date() })
        .where(eq(bookClubs.id, invite.clubId));
    }

    revalidatePath('/clubs');
    revalidatePath(`/clubs/${invite.clubId}`);
    return { success: true, message: 'Invite accepted.', clubId: invite.clubId };
  } catch {
    return { success: false, message: 'Failed to accept invite.' };
  }
}

export async function declineClubInviteAction(inviteId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const invite = await db.query.clubInvites.findFirst({
    where: and(
      eq(clubInvites.id, inviteId),
      eq(clubInvites.invitedUserId, userId),
      eq(clubInvites.status, 'PENDING'),
    ),
  });
  if (!invite) return { success: false, message: 'Invite not found.' };

  await db
    .update(clubInvites)
    .set({ status: 'DECLINED', updatedAt: new Date() })
    .where(eq(clubInvites.id, inviteId));

  revalidatePath('/clubs');
  return { success: true, message: 'Invite declined.' };
}



export async function requestToJoinClubAction(clubId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const club = await db.query.bookClubs.findFirst({ where: eq(bookClubs.id, clubId) });
  if (!club) return { success: false, message: 'Club not found.' };
  if (club.privacy === 'PRIVATE') return { success: false, message: 'This club is invite-only.' };

  if (club.privacy === 'FRIENDS') {
    const friendship = await db.query.friendships.findFirst({
      where: and(
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, club.ownerId)),
          and(eq(friendships.requesterId, club.ownerId), eq(friendships.addresseeId, userId)),
        ),
        eq(friendships.status, 'ACCEPTED'),
      ),
    });
    if (!friendship) return { success: false, message: 'This club is for friends only.' };
  }

  const existing = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
  });
  if (existing) return { success: false, message: 'Already a member.' };

  try {
    const existingRequest = await db.query.clubJoinRequests.findFirst({
      where: and(eq(clubJoinRequests.clubId, clubId), eq(clubJoinRequests.userId, userId)),
    });

    if (existingRequest?.status === 'PENDING') {
      return { success: false, message: 'You already have a pending join request.' };
    }

    if (existingRequest) {
      await db
        .update(clubJoinRequests)
        .set({ status: 'PENDING', updatedAt: new Date() })
        .where(eq(clubJoinRequests.id, existingRequest.id));
    } else {
      await db.insert(clubJoinRequests).values({ clubId, userId, status: 'PENDING' });
    }

    void insertNotification({
      recipientId: club.ownerId,
      actorId: userId,
      type: 'CLUB_JOIN_REQUEST',
      link: `/clubs/${clubId}`,
      metadata: { clubId, clubName: club.name },
    });

    revalidatePath(`/clubs/${clubId}`);
    return { success: true, message: 'Join request sent.' };
  } catch {
    return { success: false, message: 'Failed to send join request.' };
  }
}

export async function getPendingJoinRequestsAction(
  clubId: string,
): Promise<PendingJoinRequest[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return [];
  }

  const requests = await db.query.clubJoinRequests.findMany({
    where: and(eq(clubJoinRequests.clubId, clubId), eq(clubJoinRequests.status, 'PENDING')),
    with: {
      user: { columns: { clerkId: true, username: true, imageUrl: true } },
    },
    orderBy: [desc(clubJoinRequests.createdAt)],
  });

  return requests.map((r) => ({
    id: r.id,
    user: {
      clerkId: r.user.clerkId,
      username: r.user.username,
      imageUrl: r.user.imageUrl,
    },
    createdAt: r.createdAt,
  }));
}

export async function approveJoinRequestAction(requestId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const request = await db.query.clubJoinRequests.findFirst({
    where: and(eq(clubJoinRequests.id, requestId), eq(clubJoinRequests.status, 'PENDING')),
  });
  if (!request) return { success: false, message: 'Request not found.' };

  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, request.clubId), eq(clubMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return { success: false, message: 'Only owners and moderators can approve requests.' };
  }

  try {
    await db
      .update(clubJoinRequests)
      .set({ status: 'APPROVED', updatedAt: new Date() })
      .where(eq(clubJoinRequests.id, requestId));

    const existing = await db.query.clubMembers.findFirst({
      where: and(
        eq(clubMembers.clubId, request.clubId),
        eq(clubMembers.userId, request.userId),
      ),
    });
    if (!existing) {
      await db.insert(clubMembers).values({
        clubId: request.clubId,
        userId: request.userId,
        role: 'MEMBER',
      });
      await db
        .update(bookClubs)
        .set({ memberCount: sql`${bookClubs.memberCount} + 1`, updatedAt: new Date() })
        .where(eq(bookClubs.id, request.clubId));
    }

    revalidatePath(`/clubs/${request.clubId}`);
    revalidatePath(`/clubs/${request.clubId}/members`);
    return { success: true, message: 'Request approved.' };
  } catch {
    return { success: false, message: 'Failed to approve request.' };
  }
}

export async function rejectJoinRequestAction(requestId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const request = await db.query.clubJoinRequests.findFirst({
    where: and(eq(clubJoinRequests.id, requestId), eq(clubJoinRequests.status, 'PENDING')),
  });
  if (!request) return { success: false, message: 'Request not found.' };

  const membership = await db.query.clubMembers.findFirst({
    where: and(eq(clubMembers.clubId, request.clubId), eq(clubMembers.userId, userId)),
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
    return { success: false, message: 'Only owners and moderators can reject requests.' };
  }

  await db
    .update(clubJoinRequests)
    .set({ status: 'REJECTED', updatedAt: new Date() })
    .where(eq(clubJoinRequests.id, requestId));

  revalidatePath(`/clubs/${request.clubId}/members`);
  return { success: true, message: 'Request rejected.' };
}

export async function checkClubJoinRequestStatusAction(
  clubId: string,
): Promise<'none' | 'pending'> {
  const { userId } = await auth();
  if (!userId) return 'none';

  const request = await db.query.clubJoinRequests.findFirst({
    where: and(
      eq(clubJoinRequests.clubId, clubId),
      eq(clubJoinRequests.userId, userId),
      eq(clubJoinRequests.status, 'PENDING'),
    ),
  });

  return request ? 'pending' : 'none';
}
