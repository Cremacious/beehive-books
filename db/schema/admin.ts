import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const adminAuditLog = pgTable('admin_audit_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  adminId: text('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetLabel: text('target_label'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contentReports = pgTable('content_reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type', { enum: ['BOOK', 'COMMENT', 'BOOK_COMMENT', 'CLUB', 'PROMPT', 'USER'] }).notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['PENDING', 'REVIEWED', 'DISMISSED'] }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedById: text('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
});

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(users, { fields: [adminAuditLog.adminId], references: [users.id] }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  reporter: one(users, { fields: [contentReports.reporterId], references: [users.id], relationName: 'reporter' }),
  reviewedBy: one(users, { fields: [contentReports.reviewedById], references: [users.id], relationName: 'reviewedBy' }),
}));
