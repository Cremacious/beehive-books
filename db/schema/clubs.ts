import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const bookClubs = pgTable('book_clubs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  privacy: text('privacy', { enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] })
    .notNull()
    .default('PUBLIC'),
  explorable: boolean('explorable').notNull().default(false),
  rules: text('rules').notNull().default(''),
  tags: json('tags').$type<string[]>().notNull().default([]),
  coverUrl: text('cover_url'),
  memberCount: integer('member_count').notNull().default(1),
  currentBook: text('current_book'),
  currentBookAuthor: text('current_book_author'),
  progressPercent: integer('progress_percent').notNull().default(0),
  currentPage: integer('current_page').notNull().default(0),
  totalPages: integer('total_pages'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('book_clubs_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('book_clubs_member_count_idx').on(t.memberCount),
  index('book_clubs_created_at_idx').on(t.createdAt),
]);

export const clubMembers = pgTable(
  'club_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    clubId: text('club_id')
      .notNull()
      .references(() => bookClubs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['OWNER', 'MODERATOR', 'MEMBER'] })
      .notNull()
      .default('MEMBER'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_club_member_idx').on(t.clubId, t.userId)],
);

export const clubDiscussions = pgTable('club_discussions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  clubId: text('club_id')
    .notNull()
    .references(() => bookClubs.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clubDiscussionLikes = pgTable(
  'club_discussion_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    discussionId: text('discussion_id')
      .notNull()
      .references(() => clubDiscussions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.discussionId] })],
);

export const clubDiscussionReplies = pgTable('club_discussion_replies', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  discussionId: text('discussion_id')
    .notNull()
    .references(() => clubDiscussions.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clubDiscussionReplyLikes = pgTable(
  'club_discussion_reply_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    replyId: text('reply_id')
      .notNull()
      .references(() => clubDiscussionReplies.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.replyId] })],
);

export const clubReadingListBooks = pgTable('club_reading_list_books', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  clubId: text('club_id')
    .notNull()
    .references(() => bookClubs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  status: text('status', { enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] })
    .notNull()
    .default('NOT_STARTED'),
  order: integer('order').notNull().default(0),
  addedById: text('added_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const clubBookSuggestions = pgTable('club_book_suggestions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  clubId: text('club_id')
    .notNull()
    .references(() => bookClubs.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    .notNull()
    .default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clubInvites = pgTable(
  'club_invites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    clubId: text('club_id')
      .notNull()
      .references(() => bookClubs.id, { onDelete: 'cascade' }),
    invitedUserId: text('invited_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    invitedByUserId: text('invited_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['PENDING', 'ACCEPTED', 'DECLINED'] })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_club_invite_idx').on(t.clubId, t.invitedUserId)],
);

export const clubJoinRequests = pgTable(
  'club_join_requests',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    clubId: text('club_id')
      .notNull()
      .references(() => bookClubs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_club_join_request_idx').on(t.clubId, t.userId)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const bookClubsRelations = relations(bookClubs, ({ one, many }) => ({
  owner: one(users, {
    fields: [bookClubs.ownerId],
    references: [users.id],
  }),
  members: many(clubMembers),
  discussions: many(clubDiscussions),
  readingBooks: many(clubReadingListBooks),
  invites: many(clubInvites),
  joinRequests: many(clubJoinRequests),
}));

export const clubMembersRelations = relations(clubMembers, ({ one }) => ({
  club: one(bookClubs, {
    fields: [clubMembers.clubId],
    references: [bookClubs.id],
  }),
  user: one(users, {
    fields: [clubMembers.userId],
    references: [users.id],
  }),
}));

export const clubInvitesRelations = relations(clubInvites, ({ one }) => ({
  club: one(bookClubs, {
    fields: [clubInvites.clubId],
    references: [bookClubs.id],
  }),
  invitedUser: one(users, {
    fields: [clubInvites.invitedUserId],
    references: [users.id],
    relationName: 'receivedClubInvites',
  }),
  invitedBy: one(users, {
    fields: [clubInvites.invitedByUserId],
    references: [users.id],
    relationName: 'sentClubInvites',
  }),
}));

export const clubJoinRequestsRelations = relations(clubJoinRequests, ({ one }) => ({
  club: one(bookClubs, {
    fields: [clubJoinRequests.clubId],
    references: [bookClubs.id],
  }),
  user: one(users, {
    fields: [clubJoinRequests.userId],
    references: [users.id],
  }),
}));

export const clubDiscussionsRelations = relations(
  clubDiscussions,
  ({ one, many }) => ({
    club: one(bookClubs, {
      fields: [clubDiscussions.clubId],
      references: [bookClubs.id],
    }),
    author: one(users, {
      fields: [clubDiscussions.authorId],
      references: [users.id],
    }),
    likes: many(clubDiscussionLikes),
    replies: many(clubDiscussionReplies),
  }),
);

export const clubDiscussionLikesRelations = relations(
  clubDiscussionLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [clubDiscussionLikes.userId],
      references: [users.id],
    }),
    discussion: one(clubDiscussions, {
      fields: [clubDiscussionLikes.discussionId],
      references: [clubDiscussions.id],
    }),
  }),
);

export const clubDiscussionRepliesRelations = relations(
  clubDiscussionReplies,
  ({ one, many }) => ({
    discussion: one(clubDiscussions, {
      fields: [clubDiscussionReplies.discussionId],
      references: [clubDiscussions.id],
    }),
    author: one(users, {
      fields: [clubDiscussionReplies.authorId],
      references: [users.id],
    }),
    parent: one(clubDiscussionReplies, {
      fields: [clubDiscussionReplies.parentId],
      references: [clubDiscussionReplies.id],
      relationName: 'nestedReplies',
    }),
    children: many(clubDiscussionReplies, { relationName: 'nestedReplies' }),
    likes: many(clubDiscussionReplyLikes),
  }),
);

export const clubDiscussionReplyLikesRelations = relations(
  clubDiscussionReplyLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [clubDiscussionReplyLikes.userId],
      references: [users.id],
    }),
    reply: one(clubDiscussionReplies, {
      fields: [clubDiscussionReplyLikes.replyId],
      references: [clubDiscussionReplies.id],
    }),
  }),
);

export const clubReadingListBooksRelations = relations(
  clubReadingListBooks,
  ({ one }) => ({
    club: one(bookClubs, {
      fields: [clubReadingListBooks.clubId],
      references: [bookClubs.id],
    }),
    addedBy: one(users, {
      fields: [clubReadingListBooks.addedById],
      references: [users.id],
    }),
  }),
);

export const clubBookSuggestionsRelations = relations(clubBookSuggestions, ({ one }) => ({
  club: one(bookClubs, {
    fields: [clubBookSuggestions.clubId],
    references: [bookClubs.id],
  }),
  user: one(users, {
    fields: [clubBookSuggestions.userId],
    references: [users.id],
  }),
}));
