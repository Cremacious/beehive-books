'use client';

import { Heart } from 'lucide-react';
import { usePromptStore } from '@/lib/stores/prompt-store';

interface Props {
  entryId:       string;
  likeCount:     number;
  likedByMe:     boolean;
  currentUserId: string | null;
}

export function EntryLikeButton({ entryId, likeCount, likedByMe, currentUserId }: Props) {
  const { optimisticLikes, toggleEntryLike } = usePromptStore();

  const isLiked   = optimisticLikes[entryId] ?? likedByMe;
  const displayed = likeCount + (
    optimisticLikes[entryId] !== undefined
      ? (optimisticLikes[entryId] ? 1 : 0) - (likedByMe ? 1 : 0)
      : 0
  );

  return (
    <button
      onClick={() => currentUserId && toggleEntryLike(entryId, isLiked)}
      disabled={!currentUserId}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
        isLiked
          ? 'bg-[#FFC300]/10 border-[#FFC300]/30 text-[#FFC300]'
          : 'bg-white/5 border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#FFC300]/30'
      } disabled:cursor-default`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      {displayed}
    </button>
  );
}
