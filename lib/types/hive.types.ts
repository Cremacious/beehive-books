export type HivePrivacy = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type HiveStatus = 'ACTIVE' | 'COMPLETED';
export type HiveRole = 'OWNER' | 'MODERATOR' | 'CONTRIBUTOR' | 'BETA_READER';
export type ClaimStatus = 'CLAIMED' | 'IN_PROGRESS' | 'COMPLETED';
export type BetaChapterStatus = 'DRAFT' | 'READY_FOR_REVIEW' | 'IN_REVIEW' | 'REVIEWED';
export type AnnotationLayer = 'GRAMMAR' | 'PLOT' | 'TONE' | 'CONTINUITY' | 'GENERAL';
export type OutlineItemType = 'CHAPTER' | 'SCENE' | 'BEAT' | 'NOTE';
export type WikiCategory = 'CHARACTER' | 'LOCATION' | 'TIMELINE' | 'LORE' | 'TERMINOLOGY' | 'OTHER';
export type WordGoalType = 'DAILY' | 'WEEKLY' | 'TOTAL';
export type SprintStatus = 'ACTIVE' | 'COMPLETED';
export type PollStatus = 'ACTIVE' | 'CLOSED';
export type BuzzType = 'INSPIRATION' | 'MEME' | 'PLAYLIST' | 'MOOD' | 'OTHER';

export type MilestoneType =
  | 'FIRST_CELL'
  | 'SCOUT_BEE'
  | 'WORKER_BEE'
  | 'SWEET_START'
  | 'BUZZ_BUILDER'
  | 'HONEY_MAKER'
  | 'HIVE_HEART'
  | 'ROYAL_JELLY'
  | 'QUEENS_GUARD'
  | 'FULL_COMB'
  | 'FIRST_HEX'
  | 'HEXAGONAL'
  | 'HONEYCOMB'
  | 'POLLINATOR'
  | 'BUZZ_MASTER'
  | 'HIVE_MIND'
  | 'DRAFT_COMPLETE'
  | 'THE_QUEEN';

export type ActionResult = { success: boolean; message: string };

export type HiveUser = {
  clerkId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export type Hive = {
  id: string;
  ownerId: string;
  bookId: string | null;
  name: string;
  description: string;
  privacy: HivePrivacy;
  status: HiveStatus;
  coverUrl: string | null;
  tags: string[];
  genre: string;
  memberCount: number;
  totalWordCount: number;
  chapterCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type HiveWithMembership = Hive & {
  myRole: HiveRole | null;
  isMember: boolean;
};

export type HiveMember = {
  id: string;
  hiveId: string;
  userId: string;
  role: HiveRole;
  joinedAt: Date;
};

export type HiveMemberWithUser = HiveMember & {
  user: HiveUser;
};

export type HiveFormData = {
  name: string;
  description: string;
  privacy: HivePrivacy;
  genre: string;
  tags: string[];
  bookId?: string | null;
  newBookTitle?: string;
  newBookAuthor?: string;
};

export type HiveBookOption = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

export interface HiveFormProps {
  mode: 'create' | 'edit';
  hiveId?: string;
  defaultValues?: Partial<Hive>;
  cancelHref: string;
  userBooks?: HiveBookOption[];
}


export type MilestoneInfo = {
  type: MilestoneType;
  label: string;
  description: string;
  icon: string;
  threshold?: number;
};

export const MILESTONE_INFO: Record<MilestoneType, MilestoneInfo> = {
  FIRST_CELL: {
    type: 'FIRST_CELL',
    label: 'First Cell',
    description: 'Joined a hive',
    icon: '🐣',
  },
  SCOUT_BEE: {
    type: 'SCOUT_BEE',
    label: 'Scout Bee',
    description: 'Claimed your first chapter',
    icon: '🔍',
  },
  WORKER_BEE: {
    type: 'WORKER_BEE',
    label: 'Worker Bee',
    description: 'Wrote your first 100 words',
    icon: '🐝',
    threshold: 100,
  },
  SWEET_START: {
    type: 'SWEET_START',
    label: 'Sweet Start',
    description: 'Reached 1,000 words',
    icon: '🍯',
    threshold: 1000,
  },
  BUZZ_BUILDER: {
    type: 'BUZZ_BUILDER',
    label: 'Buzz Builder',
    description: 'Reached 5,000 words',
    icon: '⚡',
    threshold: 5000,
  },
  HONEY_MAKER: {
    type: 'HONEY_MAKER',
    label: 'Honey Maker',
    description: 'Reached 10,000 words',
    icon: '🌟',
    threshold: 10000,
  },
  HIVE_HEART: {
    type: 'HIVE_HEART',
    label: 'Hive Heart',
    description: 'Reached 25,000 words',
    icon: '💛',
    threshold: 25000,
  },
  ROYAL_JELLY: {
    type: 'ROYAL_JELLY',
    label: 'Royal Jelly',
    description: 'Reached 50,000 words',
    icon: '👑',
    threshold: 50000,
  },
  QUEENS_GUARD: {
    type: 'QUEENS_GUARD',
    label: "Queen's Guard",
    description: 'Reached 75,000 words',
    icon: '🛡️',
    threshold: 75000,
  },
  FULL_COMB: {
    type: 'FULL_COMB',
    label: 'Full Comb',
    description: 'Reached 100,000 words — novel length!',
    icon: '🏆',
    threshold: 100000,
  },
  FIRST_HEX: {
    type: 'FIRST_HEX',
    label: 'First Hex',
    description: 'Completed your first chapter',
    icon: '⬡',
  },
  HEXAGONAL: {
    type: 'HEXAGONAL',
    label: 'Hexagonal',
    description: 'Completed 5 chapters',
    icon: '🔷',
  },
  HONEYCOMB: {
    type: 'HONEYCOMB',
    label: 'Honeycomb',
    description: 'Completed 10 chapters',
    icon: '🍀',
  },
  POLLINATOR: {
    type: 'POLLINATOR',
    label: 'Pollinator',
    description: 'Left 10 comments or reviews',
    icon: '🌸',
  },
  BUZZ_MASTER: {
    type: 'BUZZ_MASTER',
    label: 'Buzz Master',
    description: 'Won a writing sprint',
    icon: '⚡',
  },
  HIVE_MIND: {
    type: 'HIVE_MIND',
    label: 'Hive Mind',
    description: 'All chapters have been claimed',
    icon: '🧠',
  },
  DRAFT_COMPLETE: {
    type: 'DRAFT_COMPLETE',
    label: 'Draft Complete',
    description: 'The book draft has been completed',
    icon: '📖',
  },
  THE_QUEEN: {
    type: 'THE_QUEEN',
    label: 'The Queen',
    description: 'Owner of a completed hive',
    icon: '👸',
  },
};
