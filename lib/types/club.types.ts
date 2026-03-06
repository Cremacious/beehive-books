export type ClubPrivacy = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type ClubRole = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type BookStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type BookClub = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  privacy: ClubPrivacy;
  explorable: boolean;
  rules: string;
  tags: string[];
  coverUrl: string | null;
  memberCount: number;
  currentBook: string | null;
  currentBookAuthor: string | null;
  progressPercent: number;
  currentPage: number;
  totalPages: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ClubMember = {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  joinedAt: Date;
};

export type ClubMemberWithUser = ClubMember & {
  user: {
    clerkId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
};

export type ClubWithMembership = BookClub & {
  myRole: ClubRole | null;
  isMember: boolean;
};

export type ClubDiscussion = {
  id: string;
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ClubDiscussionWithAuthor = ClubDiscussion & {
  author: {
    clerkId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  likedByMe: boolean;
};

export type ClubDiscussionReply = {
  id: string;
  discussionId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ClubDiscussionReplyWithAuthor = ClubDiscussionReply & {
  author: {
    clerkId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  likedByMe: boolean;
  children: ClubDiscussionReplyWithAuthor[];
};

export type ClubDiscussionFull = ClubDiscussionWithAuthor & {
  replies: ClubDiscussionReplyWithAuthor[];
};

export type ClubReadingListBook = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  status: BookStatus;
  order: number;
  addedById: string | null;
  addedAt: Date;
};

export type ClubFormData = {
  name: string;
  description: string;
  privacy: ClubPrivacy;
  explorable: boolean;
  rules: string;
  tags: string[];
};

export type ClubDiscussionFormData = {
  title: string;
  content: string;
};

export type InvitableClubFriend = {
  clerkId: string;
  username: string | null;
  imageUrl: string | null;
};

export type PendingClubInvite = {
  id: string;
  club: { id: string; name: string; imageUrl: string | null };
  invitedBy: { username: string | null; imageUrl: string | null };
  createdAt: Date;
};

export type PendingJoinRequest = {
  id: string;
  user: { clerkId: string; username: string | null; imageUrl: string | null };
  createdAt: Date;
};

export type ActionResult = { success: boolean; message: string };

export interface ClubFormProps {
  mode: 'create' | 'edit';
  clubId?: string;
  defaultValues?: Partial<BookClub>;
  cancelHref: string;
}
