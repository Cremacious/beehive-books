import { create } from 'zustand';
import {
  createClubAction,
  updateClubAction,
  deleteClubAction,
  joinClubAction,
  leaveClubAction,
  removeMemberAction,
  updateMemberRoleAction,
  updateClubBookAction,
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
  inviteToClubAction,
  acceptClubInviteAction,
  declineClubInviteAction,
  requestToJoinClubAction,
  approveJoinRequestAction,
  rejectJoinRequestAction,
} from '@/lib/actions/club.actions';
import type { ClubFormData, ClubDiscussionFormData, ActionResult, BookStatus } from '@/lib/types/club.types';

interface ClubStore {
  optimisticDiscussionLikes: Record<string, boolean>;
  optimisticReplyLikes: Record<string, boolean>;

  createClub: (data: ClubFormData, invitedIds?: string[]) => Promise<ActionResult & { clubId?: string }>;
  updateClub: (clubId: string, data: ClubFormData) => Promise<ActionResult>;
  deleteClub: (clubId: string) => Promise<ActionResult>;

  joinClub: (clubId: string) => Promise<ActionResult>;
  leaveClub: (clubId: string) => Promise<ActionResult>;
  removeMember: (clubId: string, userId: string) => Promise<ActionResult>;
  updateMemberRole: (clubId: string, userId: string, role: 'MODERATOR' | 'MEMBER') => Promise<ActionResult>;

  updateCurrentBook: (clubId: string, book: string, author: string) => Promise<ActionResult>;
  updateProgress: (clubId: string, currentPage: number, totalPages: number) => Promise<ActionResult>;

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

  inviteToClub: (clubId: string, friendClerkId: string) => Promise<ActionResult>;
  acceptClubInvite: (inviteId: string) => Promise<ActionResult & { clubId?: string }>;
  declineClubInvite: (inviteId: string) => Promise<ActionResult>;
  requestToJoin: (clubId: string) => Promise<ActionResult>;
  approveJoinRequest: (requestId: string) => Promise<ActionResult>;
  rejectJoinRequest: (requestId: string) => Promise<ActionResult>;
}

export const useClubStore = create<ClubStore>((set) => ({
  optimisticDiscussionLikes: {},
  optimisticReplyLikes: {},

  createClub: (data, invitedIds) => createClubAction(data, invitedIds),
  updateClub: (clubId, data) => updateClubAction(clubId, data),
  deleteClub: (clubId) => deleteClubAction(clubId),

  joinClub: (clubId) => joinClubAction(clubId),
  leaveClub: (clubId) => leaveClubAction(clubId),
  removeMember: (clubId, userId) => removeMemberAction(clubId, userId),
  updateMemberRole: (clubId, userId, role) => updateMemberRoleAction(clubId, userId, role),

  updateCurrentBook: (clubId, book, author) => updateClubBookAction(clubId, book, author),
  updateProgress: (clubId, currentPage, totalPages) =>
    updateClubProgressAction(clubId, currentPage, totalPages),

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

  inviteToClub: (clubId, friendClerkId) => inviteToClubAction(clubId, friendClerkId),
  acceptClubInvite: (inviteId) => acceptClubInviteAction(inviteId),
  declineClubInvite: (inviteId) => declineClubInviteAction(inviteId),
  requestToJoin: (clubId) => requestToJoinClubAction(clubId),
  approveJoinRequest: (requestId) => approveJoinRequestAction(requestId),
  rejectJoinRequest: (requestId) => rejectJoinRequestAction(requestId),
}));
