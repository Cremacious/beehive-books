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
import { books, chapters } from './books';

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

export const hiveChapterSubmissions = pgTable('hive_chapter_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  hiveId: text('hive_id').notNull().references(() => hives.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  targetChapterOrder: integer('target_chapter_order'),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    .notNull()
    .default('PENDING'),
  reviewedById: text('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
  reviewNote: text('review_note'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

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
  submissions: many(hiveChapterSubmissions),
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

export const hiveChapterSubmissionsRelations = relations(hiveChapterSubmissions, ({ one }) => ({
  hive: one(hives, { fields: [hiveChapterSubmissions.hiveId], references: [hives.id] }),
  user: one(users, { fields: [hiveChapterSubmissions.userId], references: [users.id] }),
  reviewedBy: one(users, {
    fields: [hiveChapterSubmissions.reviewedById],
    references: [users.id],
    relationName: 'reviewedSubmissions',
  }),
}));
