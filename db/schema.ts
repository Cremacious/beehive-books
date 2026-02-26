import { pgTable, text, timestamp, boolean, integer, primaryKey, uniqueIndex, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  clerkId:            text('clerk_id').primaryKey(),
  email:              text('email').notNull(),
  firstName:          text('first_name'),
  lastName:           text('last_name'),
  imageUrl:           text('image_url'),
  username:           text('username').unique(),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt:          timestamp('created_at').defaultNow().notNull(),
  updatedAt:          timestamp('updated_at').defaultNow().notNull(),
});

export const books = pgTable('books', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  userId:       text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  title:        text('title').notNull(),
  author:       text('author').notNull(),
  genre:        text('genre').notNull(),
  category:     text('category').notNull(),
  description:  text('description').notNull(),
  privacy:      text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] }).notNull().default('PRIVATE'),
  coverUrl:     text('cover_url'),
  wordCount:    integer('word_count').notNull().default(0),
  chapterCount: integer('chapter_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  bookId:    text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  order:     integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  bookId:       text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').references(() => collections.id, { onDelete: 'set null' }),
  title:        text('title').notNull(),
  content:      text('content'),
  authorNotes:  text('author_notes'),
  wordCount:    integer('word_count').notNull().default(0),
  order:        integer('order').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const chapterComments = pgTable('chapter_comments', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  parentId:  text('parent_id'),
  content:   text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const commentLikes = pgTable('comment_likes', {
  userId:    text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  commentId: text('comment_id').notNull().references(() => chapterComments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.commentId] }),
]);

export const readingLists = pgTable('reading_lists', {
  id:                     text('id').primaryKey().$defaultFn(() => createId()),
  userId:                 text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  title:                  text('title').notNull(),
  description:            text('description').notNull().default(''),
  privacy:                text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] }).notNull().default('PRIVATE'),
  bookCount:              integer('book_count').notNull().default(0),
  readCount:              integer('read_count').notNull().default(0),
  currentlyReadingId:     text('currently_reading_id'),
  currentlyReadingTitle:  text('currently_reading_title'),
  currentlyReadingAuthor: text('currently_reading_author'),
  createdAt:              timestamp('created_at').defaultNow().notNull(),
  updatedAt:              timestamp('updated_at').defaultNow().notNull(),
});

export const friendships = pgTable('friendships', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  requesterId: text('requester_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  addresseeId: text('addressee_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  status:      text('status', { enum: ['PENDING', 'ACCEPTED'] }).notNull().default('PENDING'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_friendship_idx').on(table.requesterId, table.addresseeId),
]);

export const readingListBooks = pgTable('reading_list_books', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  readingListId: text('reading_list_id').notNull().references(() => readingLists.id, { onDelete: 'cascade' }),
  title:         text('title').notNull(),
  author:        text('author').notNull(),
  isRead:        boolean('is_read').notNull().default(false),
  order:         integer('order').notNull().default(0),
  addedAt:       timestamp('added_at').defaultNow().notNull(),
});



export const notifications = pgTable('notifications', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  recipientId: text('recipient_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  actorId:     text('actor_id').references(() => users.clerkId, { onDelete: 'cascade' }),
  type:        text('type', { enum: [
    'FRIEND_REQUEST', 'FRIEND_ACCEPTED',
    'CHAPTER_COMMENT', 'COMMENT_REPLY', 'COMMENT_LIKE',
    'PROMPT_INVITE', 'PROMPT_ENTRY', 'PROMPT_ENDED',
    'ENTRY_COMMENT', 'ENTRY_COMMENT_LIKE',
  ] as const }).notNull(),
  isRead:      boolean('is_read').notNull().default(false),
  link:        text('link').notNull(),
  metadata:    json('metadata').$type<Record<string, string>>().notNull().default({}),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  books:                    many(books),
  comments:                 many(chapterComments),
  commentLikes:             many(commentLikes),
  readingLists:             many(readingLists),
  sentRequests:             many(friendships, { relationName: 'sentRequests' }),
  receivedRequests:         many(friendships, { relationName: 'receivedRequests' }),
  promptsCreated:           many(prompts),
  promptInvites:            many(promptInvites),
  promptEntries:            many(promptEntries),
  promptEntryLikes:         many(promptEntryLikes),
  promptEntryComments:      many(promptEntryComments),
  promptEntryCommentLikes:  many(promptEntryCommentLikes),
  notifications:            many(notifications, { relationName: 'receivedNotifications' }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields:       [friendships.requesterId],
    references:   [users.clerkId],
    relationName: 'sentRequests',
  }),
  addressee: one(users, {
    fields:       [friendships.addresseeId],
    references:   [users.clerkId],
    relationName: 'receivedRequests',
  }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  user:        one(users,       { fields: [books.userId],    references: [users.clerkId] }),
  chapters:    many(chapters),
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  book:     one(books,    { fields: [collections.bookId], references: [books.id] }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  book:       one(books,       { fields: [chapters.bookId],       references: [books.id] }),
  collection: one(collections, { fields: [chapters.collectionId], references: [collections.id] }),
  comments:   many(chapterComments),
}));

export const chapterCommentsRelations = relations(chapterComments, ({ one, many }) => ({
  chapter: one(chapters, { fields: [chapterComments.chapterId], references: [chapters.id] }),
  user:    one(users,    { fields: [chapterComments.userId],    references: [users.clerkId] }),
  parent:  one(chapterComments, {
    fields:     [chapterComments.parentId],
    references: [chapterComments.id],
    relationName: 'replies',
  }),
  replies: many(chapterComments, { relationName: 'replies' }),
  likes:   many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user:    one(users,           { fields: [commentLikes.userId],    references: [users.clerkId] }),
  comment: one(chapterComments, { fields: [commentLikes.commentId], references: [chapterComments.id] }),
}));

export const readingListsRelations = relations(readingLists, ({ one, many }) => ({
  user:  one(users, { fields: [readingLists.userId], references: [users.clerkId] }),
  books: many(readingListBooks),
}));

export const readingListBooksRelations = relations(readingListBooks, ({ one }) => ({
  readingList: one(readingLists, { fields: [readingListBooks.readingListId], references: [readingLists.id] }),
}));

/* ─── Prompts ────────────────────────────────────────────────────────────── */

export const prompts = pgTable('prompts', {
  id:         text('id').primaryKey().$defaultFn(() => createId()),
  creatorId:  text('creator_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  title:      text('title').notNull(),
  description: text('description').notNull(),
  endDate:    timestamp('end_date').notNull(),
  isPublic:   boolean('is_public').notNull().default(false),
  status:     text('status', { enum: ['ACTIVE', 'ENDED'] }).notNull().default('ACTIVE'),
  entryCount: integer('entry_count').notNull().default(0),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
});

export const promptInvites = pgTable('prompt_invites', {
  id:       text('id').primaryKey().$defaultFn(() => createId()),
  promptId: text('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  userId:   text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  status:   text('status', { enum: ['PENDING', 'ACCEPTED'] }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_prompt_invite_idx').on(table.promptId, table.userId),
]);

export const promptEntries = pgTable('prompt_entries', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  promptId:  text('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  wordCount: integer('word_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_prompt_entry_idx').on(table.promptId, table.userId),
]);

export const promptEntryLikes = pgTable('prompt_entry_likes', {
  userId:  text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  entryId: text('entry_id').notNull().references(() => promptEntries.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.entryId] }),
]);

export const promptEntryComments = pgTable('prompt_entry_comments', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  entryId:   text('entry_id').notNull().references(() => promptEntries.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  parentId:  text('parent_id'),
  content:   text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const promptEntryCommentLikes = pgTable('prompt_entry_comment_likes', {
  userId:    text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  commentId: text('comment_id').notNull().references(() => promptEntryComments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.commentId] }),
]);

/* ─── Prompt Relations ───────────────────────────────────────────────────── */

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  creator: one(users, { fields: [prompts.creatorId], references: [users.clerkId] }),
  invites: many(promptInvites),
  entries: many(promptEntries),
}));

export const promptInvitesRelations = relations(promptInvites, ({ one }) => ({
  prompt: one(prompts, { fields: [promptInvites.promptId], references: [prompts.id] }),
  user:   one(users,   { fields: [promptInvites.userId],   references: [users.clerkId] }),
}));

export const promptEntriesRelations = relations(promptEntries, ({ one, many }) => ({
  prompt:   one(prompts, { fields: [promptEntries.promptId], references: [prompts.id] }),
  user:     one(users,   { fields: [promptEntries.userId],   references: [users.clerkId] }),
  comments: many(promptEntryComments),
  likes:    many(promptEntryLikes),
}));

export const promptEntryLikesRelations = relations(promptEntryLikes, ({ one }) => ({
  user:  one(users,         { fields: [promptEntryLikes.userId],  references: [users.clerkId] }),
  entry: one(promptEntries, { fields: [promptEntryLikes.entryId], references: [promptEntries.id] }),
}));

export const promptEntryCommentsRelations = relations(promptEntryComments, ({ one, many }) => ({
  entry:   one(promptEntries,      { fields: [promptEntryComments.entryId], references: [promptEntries.id] }),
  user:    one(users,              { fields: [promptEntryComments.userId],  references: [users.clerkId] }),
  parent:  one(promptEntryComments, {
    fields:       [promptEntryComments.parentId],
    references:   [promptEntryComments.id],
    relationName: 'promptReplies',
  }),
  replies: many(promptEntryComments, { relationName: 'promptReplies' }),
  likes:   many(promptEntryCommentLikes),
}));

export const promptEntryCommentLikesRelations = relations(promptEntryCommentLikes, ({ one }) => ({
  user:    one(users,               { fields: [promptEntryCommentLikes.userId],    references: [users.clerkId] }),
  comment: one(promptEntryComments, { fields: [promptEntryCommentLikes.commentId], references: [promptEntryComments.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.recipientId], references: [users.clerkId], relationName: 'receivedNotifications' }),
  actor:     one(users, { fields: [notifications.actorId],     references: [users.clerkId], relationName: 'sentNotifications' }),
}));
