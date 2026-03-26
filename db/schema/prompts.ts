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
  status: text('status', { enum: ['ACTIVE', 'VOTING', 'ENDED'] })
    .notNull()
    .default('ACTIVE'),
  votingEndsAt: timestamp('voting_ends_at'),
  communityWinnerId: text('community_winner_id').references(() => promptEntries.id, { onDelete: 'set null' }),
  authorChoiceId: text('author_choice_id').references(() => promptEntries.id, { onDelete: 'set null' }),
  entryCount: integer('entry_count').notNull().default(0),
  tags: json('tags').$type<string[]>().notNull().default([]),
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
    title: text('title').default(''),
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

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  creator: one(users, {
    fields: [prompts.creatorId],
    references: [users.id],
  }),
  invites: many(promptInvites),
  entries: many(promptEntries),
  communityWinner: one(promptEntries, {
    fields: [prompts.communityWinnerId],
    references: [promptEntries.id],
    relationName: 'communityWinner',
  }),
  authorChoice: one(promptEntries, {
    fields: [prompts.authorChoiceId],
    references: [promptEntries.id],
    relationName: 'authorChoice',
  }),
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
    communityWinnerOf: many(prompts, { relationName: 'communityWinner' }),
    authorChoiceOf: many(prompts, { relationName: 'authorChoice' }),
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
