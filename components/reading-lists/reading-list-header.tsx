'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { followListAction, likeListAction } from '@/lib/actions/reading-list.actions';
import type { ReadingListHeaderProps } from '@/lib/types/reading-list.types';

export function ReadingListHeader({
  list,
  isOwner,
  curator,
  isFollowing: initialIsFollowing,
  isLiked: initialIsLiked,
  currentUserId,
}: ReadingListHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [followerCount, setFollowerCount] = useState(list.followerCount);
  const [likeCount, setLikeCount] = useState(list.likeCount);
  const [followPending, startFollowTransition] = useTransition();
  const [likePending, startLikeTransition] = useTransition();

  const handleFollow = () => {
    if (!currentUserId) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    startFollowTransition(async () => {
      const result = await followListAction(list.id);
      if (!result.success) {
        setIsFollowing(!next);
        setFollowerCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  const handleLike = () => {
    if (!currentUserId) return;
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    startLikeTransition(async () => {
      const result = await likeListAction(list.id);
      if (!result.success) {
        setIsLiked(!next);
        setLikeCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 mb-6">
      {/* Top row: curator + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {curator.image ? (
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative">
              <Image
                src={curator.image}
                alt={curator.username ?? 'curator'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white/80">
                {(curator.username?.[0] ?? '?').toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-white/80">
            curated by{' '}
            {curator.username ? (
              <Link
                href={`/u/${curator.username}`}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                {curator.username}
              </Link>
            ) : (
              <span className="text-white">unknown</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOwner && currentUserId && (
            <>
              <button
                onClick={handleFollow}
                disabled={followPending}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-all ${
                  isFollowing
                    ? 'bg-[#FFC300] text-black border-[#FFC300] font-medium'
                    : 'border-[#FFC300]/40 text-yellow-500 hover:bg-[#FFC300]/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleLike}
                disabled={likePending}
                className={`flex items-center gap-1.5 p-2 rounded-xl transition-all ${
                  isLiked
                    ? 'text-yellow-500'
                    : 'text-white/80 hover:text-yellow-500'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isLiked ? 'currentColor' : 'none'}
                />
              </button>
            </>
          )}
          {isOwner && (
            <Button variant="outline" asChild size="sm" className="shrink-0">
              <Link href={`/reading-lists/${list.id}/edit`}>
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white leading-tight mainFont mb-2">
        {list.title}
      </h1>

      {/* Stats row */}
      <div className="flex items-center gap-1.5 text-xs text-white/80 mb-3">
        <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
        <span className="text-white/30">·</span>
        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        <span className="text-white/30">·</span>
        <span>{list.bookCount} {list.bookCount === 1 ? 'book' : 'books'}</span>
      </div>

      {/* Description */}
      {list.description && (
        <p className="text-sm text-white/80 leading-relaxed mb-3">
          {list.description}
        </p>
      )}

      {/* Curator note */}
      {list.curatorNote && (
        <div className="bg-[#1e1e1e] border-l-2 border-[#FFC300]/40 px-4 py-3 rounded-r-xl text-sm text-white/80 italic">
          {list.curatorNote}
        </div>
      )}

      {/* Currently reading */}
      {list.currentlyReadingTitle && (
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider shrink-0">Now Reading</span>
          <span className="text-sm font-semibold text-white">{list.currentlyReadingTitle}</span>
          {list.currentlyReadingAuthor && (
            <span className="text-sm text-white/80">by {list.currentlyReadingAuthor}</span>
          )}
        </div>
      )}
    </div>
  );
}
