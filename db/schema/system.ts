import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const announcements = pgTable('announcements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type', {
    enum: ['new_feature', 'coming_soon', 'maintenance', 'community_update'],
  }).notNull().default('community_update'),
  link: text('link'),
  isActive: boolean('is_active').notNull().default(true),
  createdById: text('created_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const announcementDismissals = pgTable(
  'announcement_dismissals',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    announcementId: text('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
    dismissedAt: timestamp('dismissed_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('announcement_dismissals_user_ann_idx').on(t.userId, t.announcementId)],
);

export const feedback = pgTable('feedback', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  category: text('category', {
    enum: ['feature_request', 'bug_report', 'general', 'content_concern'],
  }).notNull(),
  email: text('email'),
  content: text('content').notNull(),
  status: text('status', {
    enum: ['pending', 'reviewed', 'in_progress', 'shipped', 'declined'],
  }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, { fields: [announcements.createdById], references: [users.id] }),
}));

export const announcementDismissalsRelations = relations(announcementDismissals, ({ one }) => ({
  user: one(users, { fields: [announcementDismissals.userId], references: [users.id] }),
  announcement: one(announcements, { fields: [announcementDismissals.announcementId], references: [announcements.id] }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));
