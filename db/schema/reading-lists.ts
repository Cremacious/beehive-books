import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  json,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const readingLists = pgTable('reading_lists', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  curatorNote: text('curator_note').default(''),
  privacy: text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] })
    .notNull()
    .default('PRIVATE'),
  explorable: boolean('explorable').notNull().default(false),
  bookCount: integer('book_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
  followerCount: integer('follower_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  currentlyReadingId: text('currently_reading_id'),
  currentlyReadingTitle: text('currently_reading_title'),
  currentlyReadingAuthor: text('currently_reading_author'),
  tags: json('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('reading_lists_explorable_privacy_idx').on(t.explorable, t.privacy),
  index('reading_lists_updated_at_idx').on(t.updatedAt),
]);

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
  rank: integer('rank'),
  commentary: text('commentary').default(''),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const readingListFollows = pgTable(
  'reading_list_follows',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    listId: text('list_id').notNull().references(() => readingLists.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listId] })],
);

export const readingListLikes = pgTable(
  'reading_list_likes',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    listId: text('list_id').notNull().references(() => readingLists.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listId] })],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const readingListsRelations = relations(
  readingLists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [readingLists.userId],
      references: [users.id],
    }),
    books: many(readingListBooks),
    follows: many(readingListFollows),
    likes: many(readingListLikes),
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

export const readingListFollowsRelations = relations(
  readingListFollows,
  ({ one }) => ({
    user: one(users, {
      fields: [readingListFollows.userId],
      references: [users.id],
    }),
    list: one(readingLists, {
      fields: [readingListFollows.listId],
      references: [readingLists.id],
    }),
  }),
);

export const readingListLikesRelations = relations(
  readingListLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [readingListLikes.userId],
      references: [users.id],
    }),
    list: one(readingLists, {
      fields: [readingListLikes.listId],
      references: [readingLists.id],
    }),
  }),
);
