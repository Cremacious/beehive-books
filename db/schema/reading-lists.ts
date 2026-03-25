import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  json,
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
  privacy: text('privacy', { enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'] })
    .notNull()
    .default('PRIVATE'),
  explorable: boolean('explorable').notNull().default(false),
  bookCount: integer('book_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
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
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

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
