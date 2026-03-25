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
  likeCount: integer('like_count').notNull().default(0),
  tags: json('tags').$type<string[]>().notNull().default([]),
  commentsEnabled: boolean('comments_enabled').notNull().default(true),
  chapterCommentsEnabled: boolean('chapter_comments_enabled').notNull().default(true),
  milestones: json('milestones').$type<{ key: string; achievedAt: string }[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('books_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('books_genre_idx').on(t.genre),
  index('books_created_at_idx').on(t.createdAt),
]);

export const bookLikes = pgTable(
  'book_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.bookId] })],
);

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

export const readingProgress = pgTable(
  'reading_progress',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('reading_progress_user_book_idx').on(t.userId, t.bookId)],
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

export const bookComments = pgTable('book_comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookCommentLikes = pgTable(
  'book_comment_likes',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: text('comment_id').notNull().references(() => bookComments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] })],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(users, { fields: [books.userId], references: [users.id] }),
  chapters: many(chapters),
  collections: many(collections),
  likes: many(bookLikes),
  bookComments: many(bookComments),
}));

export const bookLikesRelations = relations(bookLikes, ({ one }) => ({
  user: one(users, { fields: [bookLikes.userId], references: [users.id] }),
  book: one(books, { fields: [bookLikes.bookId], references: [books.id] }),
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

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  user: one(users, { fields: [readingProgress.userId], references: [users.id] }),
  book: one(books, { fields: [readingProgress.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [readingProgress.chapterId], references: [chapters.id] }),
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

export const bookCommentsRelations = relations(bookComments, ({ one, many }) => ({
  book: one(books, { fields: [bookComments.bookId], references: [books.id] }),
  user: one(users, { fields: [bookComments.userId], references: [users.id] }),
  parent: one(bookComments, {
    fields: [bookComments.parentId],
    references: [bookComments.id],
    relationName: 'bookReplies',
  }),
  replies: many(bookComments, { relationName: 'bookReplies' }),
  likes: many(bookCommentLikes),
}));

export const bookCommentLikesRelations = relations(bookCommentLikes, ({ one }) => ({
  user: one(users, { fields: [bookCommentLikes.userId], references: [users.id] }),
  comment: one(bookComments, { fields: [bookCommentLikes.commentId], references: [bookComments.id] }),
}));
