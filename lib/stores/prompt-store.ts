import { create } from 'zustand';
import {
  toggleEntryLikeAction,
  toggleEntryCommentLikeAction,
} from '@/lib/actions/prompt.actions';

interface PromptStore {
  optimisticLikes: Record<string, boolean>; 
  toggleEntryLike:   (entryId: string, currentlyLiked: boolean) => Promise<void>;
  toggleCommentLike: (commentId: string, currentlyLiked: boolean) => Promise<void>;
}

export const usePromptStore = create<PromptStore>((set) => ({
  optimisticLikes: {},

  toggleEntryLike: async (entryId, currentlyLiked) => {
    set((s) => ({
      optimisticLikes: { ...s.optimisticLikes, [entryId]: !currentlyLiked },
    }));
    const result = await toggleEntryLikeAction(entryId);
    if (!result.success) {
      set((s) => ({
        optimisticLikes: { ...s.optimisticLikes, [entryId]: currentlyLiked },
      }));
    }
  },

  toggleCommentLike: async (commentId, currentlyLiked) => {
    set((s) => ({
      optimisticLikes: { ...s.optimisticLikes, [commentId]: !currentlyLiked },
    }));
    const result = await toggleEntryCommentLikeAction(commentId);
    if (!result.success) {
      set((s) => ({
        optimisticLikes: { ...s.optimisticLikes, [commentId]: currentlyLiked },
      }));
    }
  },
}));
