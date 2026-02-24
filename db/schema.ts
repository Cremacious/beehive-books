import { pgTable, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
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



export const usersRelations = relations(users, ({ many }) => ({
  books:        many(books),
  comments:     many(chapterComments),
  commentLikes: many(commentLikes),
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
