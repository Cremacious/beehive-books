import { create } from 'zustand';
import {
  createClubAction,
  updateClubAction,
  deleteClubAction,
  joinClubAction,
  leaveClubAction,
  removeMemberAction,
  updateMemberRoleAction,
  updateClubProgressAction,
  createClubDiscussionAction,
  deleteClubDiscussionAction,
  pinDiscussionAction,
  toggleDiscussionLikeAction,
  createDiscussionReplyAction,
  deleteDiscussionReplyAction,
  toggleReplyLikeAction,
  addBookToClubListAction,
  removeBookFromClubListAction,
  updateBookStatusAction,
} from '@/lib/actions/club.actions';
import type { ClubFormData, ClubDiscussionFormData, ActionResult, BookStatus } from '@/lib/types/club.types';

interface ClubStore {
  optimisticDiscussionLikes: Record<string, boolean>;
  optimisticReplyLikes: Record<string, boolean>;

  createClub: (data: ClubFormData) => Promise<ActionResult & { clubId?: string }>;
  updateClub: (clubId: string, data: ClubFormData) => Promise<ActionResult>;
  deleteClub: (clubId: string) => Promise<ActionResult>;

  joinClub: (clubId: string) => Promise<ActionResult>;
  leaveClub: (clubId: string) => Promise<ActionResult>;
  removeMember: (clubId: string, userId: string) => Promise<ActionResult>;
  updateMemberRole: (clubId: string, userId: string, role: 'MODERATOR' | 'MEMBER') => Promise<ActionResult>;

  updateProgress: (
    clubId: string,
    percent: number,
    currentBook?: string,
    currentBookAuthor?: string,
  ) => Promise<ActionResult>;

  createDiscussion: (clubId: string, data: ClubDiscussionFormData) => Promise<ActionResult & { discussionId?: string }>;
  deleteDiscussion: (clubId: string, discussionId: string) => Promise<ActionResult>;
  pinDiscussion: (clubId: string, discussionId: string, pin: boolean) => Promise<ActionResult>;

  createReply: (
    clubId: string,
    discussionId: string,
    content: string,
    parentId?: string,
  ) => Promise<ActionResult & { replyId?: string }>;
  deleteReply: (clubId: string, replyId: string) => Promise<ActionResult>;

  addBook: (clubId: string, title: string, author: string) => Promise<ActionResult>;
  removeBook: (clubId: string, bookId: string) => Promise<ActionResult>;
  updateBookStatus: (clubId: string, bookId: string, status: BookStatus) => Promise<ActionResult>;

  toggleDiscussionLike: (discussionId: string, currentlyLiked: boolean) => Promise<void>;
  toggleReplyLike: (replyId: string, currentlyLiked: boolean) => Promise<void>;
}

export const useClubStore = create<ClubStore>((set) => ({
  optimisticDiscussionLikes: {},
  optimisticReplyLikes: {},

  createClub: (data) => createClubAction(data),
  updateClub: (clubId, data) => updateClubAction(clubId, data),
  deleteClub: (clubId) => deleteClubAction(clubId),

  joinClub: (clubId) => joinClubAction(clubId),
  leaveClub: (clubId) => leaveClubAction(clubId),
  removeMember: (clubId, userId) => removeMemberAction(clubId, userId),
  updateMemberRole: (clubId, userId, role) => updateMemberRoleAction(clubId, userId, role),

  updateProgress: (clubId, percent, book, author) =>
    updateClubProgressAction(clubId, percent, book, author),

  createDiscussion: (clubId, data) => createClubDiscussionAction(clubId, data),
  deleteDiscussion: (clubId, discussionId) => deleteClubDiscussionAction(clubId, discussionId),
  pinDiscussion: (clubId, discussionId, pin) => pinDiscussionAction(clubId, discussionId, pin),

  createReply: (clubId, discussionId, content, parentId) =>
    createDiscussionReplyAction(clubId, discussionId, content, parentId),
  deleteReply: (clubId, replyId) => deleteDiscussionReplyAction(clubId, replyId),

  addBook: (clubId, title, author) => addBookToClubListAction(clubId, title, author),
  removeBook: (clubId, bookId) => removeBookFromClubListAction(clubId, bookId),
  updateBookStatus: (clubId, bookId, status) => updateBookStatusAction(clubId, bookId, status),

  toggleDiscussionLike: async (discussionId, currentlyLiked) => {
    set((s) => ({
      optimisticDiscussionLikes: {
        ...s.optimisticDiscussionLikes,
        [discussionId]: !currentlyLiked,
      },
    }));
    const result = await toggleDiscussionLikeAction(discussionId);
    if (!result.success) {
      set((s) => ({
        optimisticDiscussionLikes: {
          ...s.optimisticDiscussionLikes,
          [discussionId]: currentlyLiked,
        },
      }));
    }
  },

  toggleReplyLike: async (replyId, currentlyLiked) => {
    set((s) => ({
      optimisticReplyLikes: {
        ...s.optimisticReplyLikes,
        [replyId]: !currentlyLiked,
      },
    }));
    const result = await toggleReplyLikeAction(replyId);
    if (!result.success) {
      set((s) => ({
        optimisticReplyLikes: {
          ...s.optimisticReplyLikes,
          [replyId]: currentlyLiked,
        },
      }));
    }
  },
}));
