import { create } from 'zustand';
import {
  toggleCommentLikeAction,
  addCommentAction,
} from '@/lib/actions/book.actions';

interface CommentStore {
  optimisticLikes: Record<string, boolean>;

  toggleLike: (commentId: string, currentlyLiked: boolean) => Promise<void>;
  addComment: (
    chapterId: string,
    content: string,
    parentId?: string | null,
  ) => Promise<{ success: boolean; message: string }>;
}

export const useCommentStore = create<CommentStore>((set) => ({
  optimisticLikes: {},

  toggleLike: async (commentId, currentlyLiked) => {
    set((s) => ({
      optimisticLikes: { ...s.optimisticLikes, [commentId]: !currentlyLiked },
    }));
    const result = await toggleCommentLikeAction(commentId);
    if (!result.success) {
      set((s) => ({
        optimisticLikes: { ...s.optimisticLikes, [commentId]: currentlyLiked },
      }));
    }
  },

  addComment: (chapterId, content, parentId) =>
    addCommentAction(chapterId, content, parentId),
}));
