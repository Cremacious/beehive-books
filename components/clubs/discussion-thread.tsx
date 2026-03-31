'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Heart,
  Trash2,
  Pin,
  PinOff,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useClubStore } from '@/lib/stores/club-store';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import DiscussionReplySection from './discussion-reply-section';
import type { ClubDiscussionFull, ClubRole } from '@/lib/types/club.types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface DiscussionThreadProps {
  discussion: ClubDiscussionFull;
  clubId: string;
  currentUserId: string | null;
  isMember: boolean;
  myRole: ClubRole | null;
}

export default function DiscussionThread({
  discussion,
  clubId,
  currentUserId,
  isMember,
  myRole,
}: DiscussionThreadProps) {
  const router = useRouter();
  const store = useClubStore();
  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';
  const isOwn = currentUserId === discussion.authorId;

  const [pinning, setPinning] = useState(false);
  const [isPinned, setIsPinned] = useState(discussion.isPinned);
  const [error, setError] = useState('');

  const optimisticLike = store.optimisticDiscussionLikes[discussion.id];
  const likedByMe =
    optimisticLike !== undefined ? optimisticLike : discussion.likedByMe;
  const likeCount =
    discussion.likeCount +
    (optimisticLike !== undefined
      ? (optimisticLike ? 1 : 0) - (discussion.likedByMe ? 1 : 0)
      : 0);

  const handleLike = async () => {
    if (!currentUserId) return;
    await store.toggleDiscussionLike(discussion.id, likedByMe);
  };

  const handlePin = async () => {
    setPinning(true);
    setIsPinned((prev) => !prev);
    const result = await store.pinDiscussion(clubId, discussion.id, !isPinned);
    setPinning(false);
    if (!result.success) {
      setIsPinned((prev) => !prev);
      setError(result.message);
    } else {
      router.refresh();
    }
  };

  const author = discussion.author;
  const authorName = author.username ?? 'Unknown';
  const initials = authorName.charAt(0).toUpperCase();

  return (
    <div>
      <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-5 mb-5">
        {isPinned && (
          <div className="flex items-center gap-1.5 mb-3">
            <Pin className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[11px] font-semibold text-yellow-500 uppercase tracking-wider">
              Pinned Discussion
            </span>
          </div>
        )}

        <div className="flex items-center gap-2.5 mb-4">
          {author.username ? (
            <Link href={`/u/${author.username}`} className="shrink-0">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={authorName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FFC300]/20 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="text-sm font-semibold text-yellow-500">
                    {initials}
                  </span>
                </div>
              )}
            </Link>
          ) : author.image ? (
            <Image
              src={author.image}
              alt={authorName}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-yellow-500">
                {initials}
              </span>
            </div>
          )}
          <div>
            {author.username ? (
              <Link href={`/u/${author.username}`} className="text-sm font-medium text-white hover:text-yellow-500 transition-colors">
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-medium text-white">{authorName}</p>
            )}
            <p className="text-xs text-white/80">
              {timeAgo(discussion.createdAt)}
            </p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-3 leading-snug mainFont">
          {discussion.title}
        </h1>

        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-4">
          {discussion.content}
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5 mb-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={handleLike}
            disabled={!currentUserId}
            aria-label={`${likeCount} like${likeCount !== 1 ? 's' : ''}, ${likedByMe ? 'unlike' : 'like'} this discussion`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              likedByMe
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/15'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart aria-hidden="true" className={`w-4 h-4 ${likedByMe ? 'fill-red-400' : ''}`} />
            <span aria-hidden="true">{likeCount}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
            <MessageSquare aria-hidden="true" className="w-4 h-4" />
            {discussion.replies.length} repl
            {discussion.replies.length !== 1 ? 'ies' : 'y'}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {isMod && (
              <button
                type="button"
                onClick={handlePin}
                disabled={pinning}
                aria-label={isPinned ? 'Unpin discussion' : 'Pin discussion'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
              >
                {pinning ? (
                  <Loader2 aria-hidden="true" className="w-3.5 h-3.5 animate-spin" />
                ) : isPinned ? (
                  <PinOff aria-hidden="true" className="w-3.5 h-3.5" />
                ) : (
                  <Pin aria-hidden="true" className="w-3.5 h-3.5" />
                )}
                {isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}

            {(isOwn || isMod) && (
              <DeleteDialog
                itemType="discussion"
                onDelete={async () => {
                  const result = await store.deleteDiscussion(clubId, discussion.id);
                  if (!result.success) throw new Error(result.message);
                  router.push(`/clubs/${clubId}/discussions`);
                }}
                trigger={
                  <button type="button" aria-label="Delete discussion" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
                    <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                    Delete
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white mb-3 mainFont">
          {discussion.replies.length} Repl
          {discussion.replies.length !== 1 ? 'ies' : 'y'}
        </h2>
        <DiscussionReplySection
          replies={discussion.replies}
          clubId={clubId}
          discussionId={discussion.id}
          currentUserId={currentUserId}
          isMember={isMember}
          myRole={myRole}
        />
      </div>
    </div>
  );
}
