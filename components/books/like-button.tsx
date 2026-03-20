'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleBookLikeAction } from '@/lib/actions/book-like.actions';

interface Props {
  bookId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  isAuthenticated: boolean;
}

export function LikeButton({ bookId, initialLiked, initialLikeCount, isAuthenticated }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) return;

    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await toggleBookLikeAction(bookId);
      if (result.success && result.likeCount !== undefined) {
        setLiked(result.liked ?? false);
        setLikeCount(result.likeCount);
      } else {
        // Revert on failure
        setLiked(initialLiked);
        setLikeCount(initialLikeCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isAuthenticated || isPending}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
        liked
          ? 'bg-[#FFC300]/10 border-[#FFC300]/30 text-[#FFC300]'
          : 'bg-white/5 border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#FFC300]/30'
      } disabled:cursor-default`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      {likeCount}
    </button>
  );
}
