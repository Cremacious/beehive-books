import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

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
      'BOOK_LIKE',
      'BOOK_COMMENT',
      'BOOK_COMMENT_REPLY',
      'BOOK_COMMENT_LIKE',
      'SUBMISSION_APPROVED',
      'SUBMISSION_REJECTED',
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
// Relations
// ---------------------------------------------------------------------------

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
