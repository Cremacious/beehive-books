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

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image_url'),
  // App-specific fields
  username: text('username').unique(),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  premium: boolean('premium').default(false).notNull(),
  role: text('role', { enum: ['member', 'moderator', 'admin'] }).notNull().default('member'),
  // Stripe billing
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// ---------------------------------------------------------------------------
// App tables (all userId/authorId/etc. now reference users.id)
// ---------------------------------------------------------------------------

export const books = pgTable('books', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  genre: text('genre').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  privacy: text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] })
    .notNull()
    .default('PRIVATE'),
  coverUrl: text('cover_url'),
  explorable: boolean('explorable').notNull().default(false),
  draftStatus: text('draft_status', {
    enum: ['FIRST_DRAFT', 'SECOND_DRAFT', 'THIRD_DRAFT', 'FOURTH_DRAFT', 'FIFTH_DRAFT', 'COMPLETED'],
  }).notNull().default('FIRST_DRAFT'),
  wordCount: integer('word_count').notNull().default(0),
  chapterCount: integer('chapter_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('books_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('books_genre_idx').on(t.genre),
  index('books_created_at_idx').on(t.createdAt),
]);

export const collections = pgTable('collections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  bookId: text('book_id')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  bookId: text('book_id')
    .notNull()
    .references(() => books.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').references(() => collections.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  content: text('content'),
  authorNotes: text('author_notes'),
  wordCount: integer('word_count').notNull().default(0),
  order: integer('order').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userChapterReads = pgTable(
  'user_chapter_reads',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('user_chapter_reads_user_chapter_idx').on(t.userId, t.chapterId)],
);

export const chapterComments = pgTable('chapter_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapters.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const commentLikes = pgTable(
  'comment_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: text('comment_id')
      .notNull()
      .references(() => chapterComments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] })],
);

export const readingLists = pgTable('reading_lists', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  privacy: text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] })
    .notNull()
    .default('PRIVATE'),
  explorable: boolean('explorable').notNull().default(false),
  bookCount: integer('book_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
  currentlyReadingId: text('currently_reading_id'),
  currentlyReadingTitle: text('currently_reading_title'),
  currentlyReadingAuthor: text('currently_reading_author'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('reading_lists_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('reading_lists_updated_at_idx').on(t.updatedAt),
]);

export const friendships = pgTable(
  'friendships',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    requesterId: text('requester_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    addresseeId: text('addressee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['PENDING', 'ACCEPTED'] })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_friendship_idx').on(
      table.requesterId,
      table.addresseeId,
    ),
  ],
);

export const readingListBooks = pgTable('reading_list_books', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  readingListId: text('reading_list_id')
    .notNull()
    .references(() => readingLists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  order: integer('order').notNull().default(0),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  actorId: text('actor_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  type: text('type', {
    enum: [
      'FRIEND_REQUEST',
      'FRIEND_ACCEPTED',
      'CHAPTER_COMMENT',
      'COMMENT_REPLY',
      'COMMENT_LIKE',
      'PROMPT_INVITE',
      'PROMPT_ENTRY',
      'PROMPT_ENDED',
      'ENTRY_COMMENT',
      'ENTRY_COMMENT_LIKE',
      'CLUB_INVITE',
      'CLUB_JOIN_REQUEST',
      'CLUB_DISCUSSION',
      'CLUB_REPLY',
      'HIVE_INVITE',
      'HIVE_JOIN_REQUEST',
      'HIVE_CHAPTER_CLAIMED',
      'HIVE_SPRINT_STARTED',
      'HIVE_MILESTONE',
      'HIVE_COMMENT',
      'HIVE_POLL',
      'HIVE_BETA_REVIEW',
      'HIVE_INVITE_PENDING',
      'HIVE_ACTIVITY',
    ] as const,
  }).notNull(),
  isRead: boolean('is_read').notNull().default(false),
  link: text('link').notNull(),
  metadata: json('metadata')
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export const announcements = pgTable('announcements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdById: text('created_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export const feedback = pgTable('feedback', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  type: text('type', {
    enum: ['content_suggestion', 'general_feedback', 'technical_support'],
  }).notNull(),
  email: text('email'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

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
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: 'sentRequests',
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: 'receivedRequests',
  }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(users, { fields: [books.userId], references: [users.id] }),
  chapters: many(chapters),
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  book: one(books, { fields: [collections.bookId], references: [books.id] }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  book: one(books, { fields: [chapters.bookId], references: [books.id] }),
  collection: one(collections, {
    fields: [chapters.collectionId],
    references: [collections.id],
  }),
  comments: many(chapterComments),
  reads: many(userChapterReads),
}));

export const userChapterReadsRelations = relations(userChapterReads, ({ one }) => ({
  user: one(users, { fields: [userChapterReads.userId], references: [users.id] }),
  chapter: one(chapters, { fields: [userChapterReads.chapterId], references: [chapters.id] }),
}));

export const chapterCommentsRelations = relations(
  chapterComments,
  ({ one, many }) => ({
    chapter: one(chapters, {
      fields: [chapterComments.chapterId],
      references: [chapters.id],
    }),
    user: one(users, {
      fields: [chapterComments.userId],
      references: [users.id],
    }),
    parent: one(chapterComments, {
      fields: [chapterComments.parentId],
      references: [chapterComments.id],
      relationName: 'replies',
    }),
    replies: many(chapterComments, { relationName: 'replies' }),
    likes: many(commentLikes),
  }),
);

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
  comment: one(chapterComments, {
    fields: [commentLikes.commentId],
    references: [chapterComments.id],
  }),
}));

export const readingListsRelations = relations(
  readingLists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [readingLists.userId],
      references: [users.id],
    }),
    books: many(readingListBooks),
  }),
);

export const readingListBooksRelations = relations(
  readingListBooks,
  ({ one }) => ({
    readingList: one(readingLists, {
      fields: [readingListBooks.readingListId],
      references: [readingLists.id],
    }),
  }),
);

export const prompts = pgTable('prompts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  endDate: timestamp('end_date').notNull(),
  privacy: text('privacy', { enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] })
    .notNull()
    .default('PRIVATE'),
  explorable: boolean('explorable').notNull().default(false),
  status: text('status', { enum: ['ACTIVE', 'ENDED'] })
    .notNull()
    .default('ACTIVE'),
  entryCount: integer('entry_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('prompts_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('prompts_created_at_idx').on(t.createdAt),
]);

export const promptInvites = pgTable(
  'prompt_invites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    promptId: text('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['PENDING', 'ACCEPTED'] })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_prompt_invite_idx').on(table.promptId, table.userId),
  ],
);

export const promptEntries = pgTable(
  'prompt_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    promptId: text('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    likeCount: integer('like_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_prompt_entry_idx').on(table.promptId, table.userId),
  ],
);

export const promptEntryLikes = pgTable(
  'prompt_entry_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    entryId: text('entry_id')
      .notNull()
      .references(() => promptEntries.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.entryId] })],
);

export const promptEntryComments = pgTable('prompt_entry_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  entryId: text('entry_id')
    .notNull()
    .references(() => promptEntries.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const promptEntryCommentLikes = pgTable(
  'prompt_entry_comment_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: text('comment_id')
      .notNull()
      .references(() => promptEntryComments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] })],
);

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  creator: one(users, {
    fields: [prompts.creatorId],
    references: [users.id],
  }),
  invites: many(promptInvites),
  entries: many(promptEntries),
}));

export const promptInvitesRelations = relations(promptInvites, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptInvites.promptId],
    references: [prompts.id],
  }),
  user: one(users, {
    fields: [promptInvites.userId],
    references: [users.id],
  }),
}));

export const promptEntriesRelations = relations(
  promptEntries,
  ({ one, many }) => ({
    prompt: one(prompts, {
      fields: [promptEntries.promptId],
      references: [prompts.id],
    }),
    user: one(users, {
      fields: [promptEntries.userId],
      references: [users.id],
    }),
    comments: many(promptEntryComments),
    likes: many(promptEntryLikes),
  }),
);

export const promptEntryLikesRelations = relations(
  promptEntryLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [promptEntryLikes.userId],
      references: [users.id],
    }),
    entry: one(promptEntries, {
      fields: [promptEntryLikes.entryId],
      references: [promptEntries.id],
    }),
  }),
);

export const promptEntryCommentsRelations = relations(
  promptEntryComments,
  ({ one, many }) => ({
    entry: one(promptEntries, {
      fields: [promptEntryComments.entryId],
      references: [promptEntries.id],
    }),
    user: one(users, {
      fields: [promptEntryComments.userId],
      references: [users.id],
    }),
    parent: one(promptEntryComments, {
      fields: [promptEntryComments.parentId],
      references: [promptEntryComments.id],
      relationName: 'promptReplies',
    }),
    replies: many(promptEntryComments, { relationName: 'promptReplies' }),
    likes: many(promptEntryCommentLikes),
  }),
);

export const promptEntryCommentLikesRelations = relations(
  promptEntryCommentLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [promptEntryCommentLikes.userId],
      references: [users.id],
    }),
    comment: one(promptEntryComments, {
      fields: [promptEntryCommentLikes.commentId],
      references: [promptEntryComments.id],
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: 'receivedNotifications',
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: 'sentNotifications',
  }),
}));

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Hives
// ---------------------------------------------------------------------------

export const hives = pgTable('hives', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  bookId: text('book_id').references(() => books.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  privacy: text('privacy', { enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] })
    .notNull()
    .default('PRIVATE'),
  explorable: boolean('explorable').notNull().default(false),
  status: text('status', { enum: ['ACTIVE', 'COMPLETED'] })
    .notNull()
    .default('ACTIVE'),
  coverUrl: text('cover_url'),
  tags: json('tags').$type<string[]>().notNull().default([]),
  genre: text('genre').notNull().default(''),
  memberCount: integer('member_count').notNull().default(1),
  totalWordCount: integer('total_word_count').notNull().default(0),
  chapterCount: integer('chapter_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('hives_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('hives_genre_idx').on(t.genre),
  index('hives_member_count_idx').on(t.memberCount),
  index('hives_created_at_idx').on(t.createdAt),
]);

export const hiveMembers = pgTable(
  'hive_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['OWNER', 'MODERATOR', 'CONTRIBUTOR', 'BETA_READER'],
    })
      .notNull()
      .default('CONTRIBUTOR'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_member_idx').on(t.hiveId, t.userId)],
);

export const hiveInvites = pgTable(
  'hive_invites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    invitedUserId: text('invited_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    invitedByUserId: text('invited_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['MODERATOR', 'CONTRIBUTOR', 'BETA_READER'],
    })
      .notNull()
      .default('CONTRIBUTOR'),
    status: text('status', {
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_invite_idx').on(t.hiveId, t.invitedUserId)],
);

export const hiveJoinRequests = pgTable(
  'hive_join_requests',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] })
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_join_request_idx').on(t.hiveId, t.userId)],
);

export const hiveChapterClaims = pgTable(
  'hive_chapter_claims',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['CLAIMED', 'IN_PROGRESS', 'COMPLETED'],
    })
      .notNull()
      .default('CLAIMED'),
    claimedAt: timestamp('claimed_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (t) => [uniqueIndex('unique_hive_chapter_claim_idx').on(t.hiveId, t.chapterId)],
);

export const hiveBetaChapterStatus = pgTable(
  'hive_beta_chapter_status',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['DRAFT', 'READY_FOR_REVIEW', 'IN_REVIEW', 'REVIEWED'],
    })
      .notNull()
      .default('DRAFT'),
    updatedById: text('updated_by_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_beta_chapter_idx').on(t.hiveId, t.chapterId)],
);

export const hiveInlineComments = pgTable('hive_inline_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapters.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  selectionStart: integer('selection_start').notNull(),
  selectionEnd: integer('selection_end').notNull(),
  selectedText: text('selected_text').notNull(),
  content: text('content').notNull(),
  layer: text('layer', {
    enum: ['GRAMMAR', 'PLOT', 'TONE', 'CONTINUITY', 'GENERAL'],
  })
    .notNull()
    .default('GENERAL'),
  status: text('status', { enum: ['OPEN', 'RESOLVED'] })
    .notNull()
    .default('OPEN'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveOutlineItems = pgTable('hive_outline_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  createdById: text('created_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  type: text('type', { enum: ['CHAPTER', 'SCENE', 'BEAT', 'NOTE', 'GROUP', 'ACT', 'SUBPLOT', 'CHARACTER_ARC', 'PLOT_POINT', 'CONFLICT', 'THEME', 'WORLD_BUILDING', 'DIALOGUE'] })
    .notNull()
    .default('CHAPTER'),
  order: integer('order').notNull().default(0),
  parentId: text('parent_id'),
  color: text('color').notNull().default('#FFC300'),
  assignedToId: text('assigned_to_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hiveWikiEntries = pgTable('hive_wiki_entries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  category: text('category', {
    enum: ['CHARACTER', 'LOCATION', 'TIMELINE', 'LORE', 'TERMINOLOGY', 'OTHER', 'PLOT', 'ARTIFACT', 'FACTION', 'CULTURE', 'LANGUAGE', 'BIOLOGY', 'THEME', 'ECONOMY'],
  })
    .notNull()
    .default('OTHER'),
  tags: json('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hiveVersionSnapshots = pgTable('hive_version_snapshots', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapters.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull().default(''),
  wordCount: integer('word_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveStyleGuide = pgTable('hive_style_guide', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' })
    .unique(),
  content: text('content').notNull().default(''),
  updatedById: text('updated_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hiveWordGoals = pgTable('hive_word_goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  createdById: text('created_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  type: text('type', { enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'TOTAL'] })
    .notNull()
    .default('TOTAL'),
  targetWords: integer('target_words').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveWordLogs = pgTable('hive_word_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id').references(() => chapters.id, {
    onDelete: 'set null',
  }),
  wordsAdded: integer('words_added').notNull(),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});

export const hiveMilestones = pgTable(
  'hive_milestones',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    hiveId: text('hive_id')
      .notNull()
      .references(() => hives.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: [
        'FIRST_CELL',
        'SCOUT_BEE',
        'WORKER_BEE',
        'SWEET_START',
        'BUZZ_BUILDER',
        'HONEY_MAKER',
        'HIVE_HEART',
        'ROYAL_JELLY',
        'QUEENS_GUARD',
        'FULL_COMB',
        'FIRST_HEX',
        'HEXAGONAL',
        'HONEYCOMB',
        'POLLINATOR',
        'BUZZ_MASTER',
        'HIVE_MIND',
        'DRAFT_COMPLETE',
        'THE_QUEEN',
      ] as const,
    }).notNull(),
    unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
    metadata: json('metadata')
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
  },
  (t) => [uniqueIndex('unique_hive_milestone_idx').on(t.hiveId, t.userId, t.type)],
);

export const hiveSprints = pgTable('hive_sprints', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  startedById: text('started_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  durationMinutes: integer('duration_minutes').notNull().default(25),
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  status: text('status', { enum: ['ACTIVE', 'COMPLETED'] })
    .notNull()
    .default('ACTIVE'),
  winnerId: text('winner_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveSprintParticipants = pgTable(
  'hive_sprint_participants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    sprintId: text('sprint_id')
      .notNull()
      .references(() => hiveSprints.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    wordsBefore: integer('words_before').notNull().default(0),
    wordsAfter: integer('words_after'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_sprint_participant_idx').on(t.sprintId, t.userId)],
);

export const hivePolls = pgTable('hive_polls', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: json('options').$type<string[]>().notNull().default([]),
  isMultiChoice: boolean('is_multi_choice').notNull().default(false),
  endsAt: timestamp('ends_at'),
  status: text('status', { enum: ['ACTIVE', 'CLOSED'] })
    .notNull()
    .default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hivePollVotes = pgTable(
  'hive_poll_votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => hivePolls.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    selectedOptions: json('selected_options').$type<number[]>().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unique_hive_poll_vote_idx').on(t.pollId, t.userId)],
);

export const hiveChatMessages = pgTable('hive_chat_messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveBuzzItems = pgTable('hive_buzz_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  hiveId: text('hive_id')
    .notNull()
    .references(() => hives.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type', {
    enum: ['INSPIRATION', 'MEME', 'PLAYLIST', 'MOOD', 'OTHER'],
  })
    .notNull()
    .default('OTHER'),
  mediaUrl: text('media_url'),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hiveBuzzLikes = pgTable(
  'hive_buzz_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    buzzId: text('buzz_id')
      .notNull()
      .references(() => hiveBuzzItems.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.buzzId] })],
);

export const hivesRelations = relations(hives, ({ one, many }) => ({
  owner: one(users, { fields: [hives.ownerId], references: [users.id] }),
  book: one(books, { fields: [hives.bookId], references: [books.id] }),
  members: many(hiveMembers),
  invites: many(hiveInvites),
  joinRequests: many(hiveJoinRequests),
  outlineItems: many(hiveOutlineItems),
  wikiEntries: many(hiveWikiEntries),
  chapterClaims: many(hiveChapterClaims),
  wordGoals: many(hiveWordGoals),
  wordLogs: many(hiveWordLogs),
  milestones: many(hiveMilestones),
  sprints: many(hiveSprints),
  polls: many(hivePolls),
  chatMessages: many(hiveChatMessages),
  buzzItems: many(hiveBuzzItems),
}));

export const hiveMembersRelations = relations(hiveMembers, ({ one }) => ({
  hive: one(hives, { fields: [hiveMembers.hiveId], references: [hives.id] }),
  user: one(users, { fields: [hiveMembers.userId], references: [users.id] }),
}));

export const hiveInvitesRelations = relations(hiveInvites, ({ one }) => ({
  hive: one(hives, { fields: [hiveInvites.hiveId], references: [hives.id] }),
  invitedUser: one(users, {
    fields: [hiveInvites.invitedUserId],
    references: [users.id],
    relationName: 'receivedHiveInvites',
  }),
  invitedBy: one(users, {
    fields: [hiveInvites.invitedByUserId],
    references: [users.id],
    relationName: 'sentHiveInvites',
  }),
}));

export const hiveJoinRequestsRelations = relations(hiveJoinRequests, ({ one }) => ({
  hive: one(hives, { fields: [hiveJoinRequests.hiveId], references: [hives.id] }),
  user: one(users, { fields: [hiveJoinRequests.userId], references: [users.id] }),
}));

export const hiveChapterClaimsRelations = relations(hiveChapterClaims, ({ one }) => ({
  hive: one(hives, { fields: [hiveChapterClaims.hiveId], references: [hives.id] }),
  chapter: one(chapters, { fields: [hiveChapterClaims.chapterId], references: [chapters.id] }),
  user: one(users, { fields: [hiveChapterClaims.userId], references: [users.id] }),
}));

export const hiveBetaChapterStatusRelations = relations(hiveBetaChapterStatus, ({ one }) => ({
  hive: one(hives, { fields: [hiveBetaChapterStatus.hiveId], references: [hives.id] }),
  chapter: one(chapters, { fields: [hiveBetaChapterStatus.chapterId], references: [chapters.id] }),
  updatedBy: one(users, { fields: [hiveBetaChapterStatus.updatedById], references: [users.id] }),
}));

export const hiveInlineCommentsRelations = relations(hiveInlineComments, ({ one }) => ({
  hive: one(hives, { fields: [hiveInlineComments.hiveId], references: [hives.id] }),
  chapter: one(chapters, { fields: [hiveInlineComments.chapterId], references: [chapters.id] }),
  author: one(users, { fields: [hiveInlineComments.authorId], references: [users.id] }),
}));

export const hiveOutlineItemsRelations = relations(hiveOutlineItems, ({ one }) => ({
  hive: one(hives, { fields: [hiveOutlineItems.hiveId], references: [hives.id] }),
  createdBy: one(users, { fields: [hiveOutlineItems.createdById], references: [users.id] }),
  assignedTo: one(users, {
    fields: [hiveOutlineItems.assignedToId],
    references: [users.id],
    relationName: 'assignedOutlineItems',
  }),
}));

export const hiveWikiEntriesRelations = relations(hiveWikiEntries, ({ one }) => ({
  hive: one(hives, { fields: [hiveWikiEntries.hiveId], references: [hives.id] }),
  author: one(users, { fields: [hiveWikiEntries.authorId], references: [users.id] }),
}));

export const hiveVersionSnapshotsRelations = relations(hiveVersionSnapshots, ({ one }) => ({
  hive: one(hives, { fields: [hiveVersionSnapshots.hiveId], references: [hives.id] }),
  chapter: one(chapters, { fields: [hiveVersionSnapshots.chapterId], references: [chapters.id] }),
  author: one(users, { fields: [hiveVersionSnapshots.authorId], references: [users.id] }),
}));

export const hiveStyleGuideRelations = relations(hiveStyleGuide, ({ one }) => ({
  hive: one(hives, { fields: [hiveStyleGuide.hiveId], references: [hives.id] }),
  updatedBy: one(users, { fields: [hiveStyleGuide.updatedById], references: [users.id] }),
}));

export const hiveWordGoalsRelations = relations(hiveWordGoals, ({ one }) => ({
  hive: one(hives, { fields: [hiveWordGoals.hiveId], references: [hives.id] }),
  createdBy: one(users, { fields: [hiveWordGoals.createdById], references: [users.id] }),
}));

export const hiveWordLogsRelations = relations(hiveWordLogs, ({ one }) => ({
  hive: one(hives, { fields: [hiveWordLogs.hiveId], references: [hives.id] }),
  user: one(users, { fields: [hiveWordLogs.userId], references: [users.id] }),
  chapter: one(chapters, { fields: [hiveWordLogs.chapterId], references: [chapters.id] }),
}));

export const hiveMilestonesRelations = relations(hiveMilestones, ({ one }) => ({
  hive: one(hives, { fields: [hiveMilestones.hiveId], references: [hives.id] }),
  user: one(users, { fields: [hiveMilestones.userId], references: [users.id] }),
}));

export const hiveSprintsRelations = relations(hiveSprints, ({ one, many }) => ({
  hive: one(hives, { fields: [hiveSprints.hiveId], references: [hives.id] }),
  startedBy: one(users, { fields: [hiveSprints.startedById], references: [users.id] }),
  winner: one(users, {
    fields: [hiveSprints.winnerId],
    references: [users.id],
    relationName: 'wonSprints',
  }),
  participants: many(hiveSprintParticipants),
}));

export const hiveSprintParticipantsRelations = relations(hiveSprintParticipants, ({ one }) => ({
  sprint: one(hiveSprints, { fields: [hiveSprintParticipants.sprintId], references: [hiveSprints.id] }),
  user: one(users, { fields: [hiveSprintParticipants.userId], references: [users.id] }),
}));

export const hivePollsRelations = relations(hivePolls, ({ one, many }) => ({
  hive: one(hives, { fields: [hivePolls.hiveId], references: [hives.id] }),
  author: one(users, { fields: [hivePolls.authorId], references: [users.id] }),
  votes: many(hivePollVotes),
}));

export const hivePollVotesRelations = relations(hivePollVotes, ({ one }) => ({
  poll: one(hivePolls, { fields: [hivePollVotes.pollId], references: [hivePolls.id] }),
  user: one(users, { fields: [hivePollVotes.userId], references: [users.id] }),
}));

export const hiveChatMessagesRelations = relations(hiveChatMessages, ({ one }) => ({
  hive: one(hives, { fields: [hiveChatMessages.hiveId], references: [hives.id] }),
  author: one(users, { fields: [hiveChatMessages.authorId], references: [users.id] }),
}));

export const hiveBuzzItemsRelations = relations(hiveBuzzItems, ({ one, many }) => ({
  hive: one(hives, { fields: [hiveBuzzItems.hiveId], references: [hives.id] }),
  author: one(users, { fields: [hiveBuzzItems.authorId], references: [users.id] }),
  likes: many(hiveBuzzLikes),
}));

export const hiveBuzzLikesRelations = relations(hiveBuzzLikes, ({ one }) => ({
  user: one(users, { fields: [hiveBuzzLikes.userId], references: [users.id] }),
  buzzItem: one(hiveBuzzItems, { fields: [hiveBuzzLikes.buzzId], references: [hiveBuzzItems.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, { fields: [announcements.createdById], references: [users.id] }),
}));
