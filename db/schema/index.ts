export * from './auth';
export * from './books';
export * from './reading-lists';
export * from './social';
export * from './prompts';
export * from './clubs';
export * from './hives';
export * from './system';
export * from './admin';

// ---------------------------------------------------------------------------
// usersRelations — defined here because it references tables from all modules
// ---------------------------------------------------------------------------

import { relations } from 'drizzle-orm';
import { users } from './auth';
import { books, chapterComments, commentLikes, bookLikes, bookComments, bookCommentLikes } from './books';
import { readingLists, readingListFollows, readingListLikes } from './reading-lists';
import { friendships, notifications } from './social';
import {
  prompts,
  promptInvites,
  promptEntries,
  promptEntryLikes,
  promptEntryComments,
  promptEntryCommentLikes,
} from './prompts';
import {
  clubMembers,
  clubDiscussions,
  clubDiscussionReplies,
} from './clubs';
import { hiveMembers, hiveInvites } from './hives';
import { adminAuditLog, contentReports } from './admin';

export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  comments: many(chapterComments),
  commentLikes: many(commentLikes),
  readingLists: many(readingLists),
  sentRequests: many(friendships, { relationName: 'sentRequests' }),
  receivedRequests: many(friendships, { relationName: 'receivedRequests' }),
  promptsCreated: many(prompts),
  promptInvites: many(promptInvites),
  promptEntries: many(promptEntries),
  promptEntryLikes: many(promptEntryLikes),
  promptEntryComments: many(promptEntryComments),
  promptEntryCommentLikes: many(promptEntryCommentLikes),
  notifications: many(notifications, { relationName: 'receivedNotifications' }),
  clubMemberships: many(clubMembers),
  clubDiscussions: many(clubDiscussions),
  clubDiscussionReplies: many(clubDiscussionReplies),
  hiveMemberships: many(hiveMembers),
  hiveInvitesReceived: many(hiveInvites, { relationName: 'receivedHiveInvites' }),
  bookLikes: many(bookLikes),
  bookComments: many(bookComments),
  bookCommentLikes: many(bookCommentLikes),
  readingListFollows: many(readingListFollows),
  readingListLikes: many(readingListLikes),
  adminAuditLogs: many(adminAuditLog),
  contentReportsAsReporter: many(contentReports, { relationName: 'reporter' }),
  contentReportsReviewed: many(contentReports, { relationName: 'reviewedBy' }),
}));
