'use server';

import { and, eq, lt } from 'drizzle-orm';
import { db } from '@/db';
import {
  notifications,
  friendships,
  hiveInvites,
  hiveJoinRequests,
  clubInvites,
  clubJoinRequests,
  promptInvites,
} from '@/db/schema';

export type CleanupResult = {
  deletedNotifications: number;
  deletedStaleFriendRequests: number;
  deletedStaleHiveInvites: number;
  deletedStaleHiveJoinRequests: number;
  deletedStaleClubInvites: number;
  deletedStaleClubJoinRequests: number;
  deletedStalePromptInvites: number;
};

export async function runCleanupAction(): Promise<CleanupResult> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    notifResult,
    friendResult,
    hiveInviteResult,
    hiveJoinResult,
    clubInviteResult,
    clubJoinResult,
    promptInviteResult,
  ] = await Promise.all([
    // Delete read notifications older than 30 days
    db
      .delete(notifications)
      .where(
        and(
          eq(notifications.isRead, true),
          lt(notifications.createdAt, thirtyDaysAgo),
        ),
      )
      .returning({ id: notifications.id }),

    // Delete pending friend requests older than 90 days
    db
      .delete(friendships)
      .where(
        and(
          eq(friendships.status, 'PENDING'),
          lt(friendships.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: friendships.id }),

    // Delete declined/pending hive invites older than 90 days
    db
      .delete(hiveInvites)
      .where(
        and(
          eq(hiveInvites.status, 'DECLINED'),
          lt(hiveInvites.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: hiveInvites.id }),

    // Delete rejected/pending hive join requests older than 90 days
    db
      .delete(hiveJoinRequests)
      .where(
        and(
          eq(hiveJoinRequests.status, 'REJECTED'),
          lt(hiveJoinRequests.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: hiveJoinRequests.id }),

    // Delete declined club invites older than 90 days
    db
      .delete(clubInvites)
      .where(
        and(
          eq(clubInvites.status, 'DECLINED'),
          lt(clubInvites.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: clubInvites.id }),

    // Delete rejected club join requests older than 90 days
    db
      .delete(clubJoinRequests)
      .where(
        and(
          eq(clubJoinRequests.status, 'REJECTED'),
          lt(clubJoinRequests.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: clubJoinRequests.id }),

    // Delete pending prompt invites older than 90 days
    db
      .delete(promptInvites)
      .where(
        and(
          eq(promptInvites.status, 'PENDING'),
          lt(promptInvites.createdAt, ninetyDaysAgo),
        ),
      )
      .returning({ id: promptInvites.id }),
  ]);

  return {
    deletedNotifications: notifResult.length,
    deletedStaleFriendRequests: friendResult.length,
    deletedStaleHiveInvites: hiveInviteResult.length,
    deletedStaleHiveJoinRequests: hiveJoinResult.length,
    deletedStaleClubInvites: clubInviteResult.length,
    deletedStaleClubJoinRequests: clubJoinResult.length,
    deletedStalePromptInvites: promptInviteResult.length,
  };
}
