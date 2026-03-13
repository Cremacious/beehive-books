'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Reply, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useClubStore } from '@/lib/stores/club-store';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import type {
  ClubDiscussionReplyWithAuthor,
  ClubRole,
} from '@/lib/types/club.types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface DiscussionReplyProps {
  reply: ClubDiscussionReplyWithAuthor;
  clubId: string;
  discussionId: string;
  currentUserId: string | null;
  isMember: boolean;
  myRole: ClubRole | null;
  depth?: number;
}

export default function DiscussionReply({
  reply,
  clubId,
  discussionId,
  currentUserId,
  isMember,
  myRole,
  depth = 0,
}: DiscussionReplyProps) {
  const router = useRouter();
  const store = useClubStore();
  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';
  const isOwn = currentUserId === reply.authorId;

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyError, setReplyError] = useState('');

  const optimisticLike = store.optimisticReplyLikes[reply.id];
  const likedByMe =
    optimisticLike !== undefined ? optimisticLike : reply.likedByMe;
  const likeCount =
    reply.likeCount +
    (optimisticLike !== undefined
      ? (optimisticLike ? 1 : 0) - (reply.likedByMe ? 1 : 0)
      : 0);

  const handleLike = async () => {
    if (!currentUserId) return;
    await store.toggleReplyLike(reply.id, likedByMe);
  };

  const handlePostReply = async () => {
    if (!replyContent.trim()) return;
    setPosting(true);
    setReplyError('');
    const result = await store.createReply(
      clubId,
      discussionId,
      replyContent.trim(),
      reply.id,
    );
    setPosting(false);
    if (result.success) {
      setReplyContent('');
      setShowReplyInput(false);
      router.refresh();
    } else {
      setReplyError(result.message);
    }
  };

  const author = reply.author;
  const authorName = author.username ?? 'Unknown';
  const initials = authorName.charAt(0).toUpperCase();

  return (
    <div className={depth > 0 ? 'pl-4 border-l border-[#2a2a2a]' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-2">
          {author.username ? (
            <Link href={`/u/${author.username}`} className="shrink-0 hover:opacity-80 transition-opacity">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={authorName}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#FFC300]/20 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-[#FFC300]">
                    {initials}
                  </span>
                </div>
              )}
            </Link>
          ) : author.image ? (
            <Image
              src={author.image}
              alt={authorName}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-[#FFC300]">
                {initials}
              </span>
            </div>
          )}
          {author.username ? (
            <Link href={`/u/${author.username}`} className="text-xs font-medium text-white hover:text-[#FFC300] transition-colors">
              {authorName}
            </Link>
          ) : (
            <span className="text-xs font-medium text-white">{authorName}</span>
          )}
          <span className="text-xs text-white/80">·</span>
          <span className="text-xs text-white/80">
            {timeAgo(reply.createdAt)}
          </span>
        </div>

        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-2 pl-9">
          {reply.content}
        </p>

        <div className="flex items-center gap-2 pl-9">
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`inline-flex items-center gap-1 text-xs transition-all ${
              likedByMe
                ? 'text-red-400 hover:text-red-300'
                : 'text-white/80 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${likedByMe ? 'fill-red-400' : ''}`}
            />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {isMember && depth < 2 && (
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {(isOwn || isMod) && (
            <DeleteDialog
              itemType="reply"
              onDelete={async () => {
                const result = await store.deleteReply(clubId, reply.id);
                if (!result.success) throw new Error(result.message);
                router.refresh();
              }}
              trigger={
                <button className="inline-flex items-center gap-1 text-xs text-red-400/80 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              }
            />
          )}
        </div>

        {showReplyInput && (
          <div className="mt-3 pl-9 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              placeholder={`Replying to ${authorName}…`}
              className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
            />
            {replyError && <p className="text-xs text-red-400">{replyError}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePostReply}
                disabled={posting || !replyContent.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#e0ac01] disabled:opacity-50 transition-colors"
              >
                {posting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Post Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent('');
                  setReplyError('');
                }}
                className="text-xs text-white/80 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {reply.children && reply.children.length > 0 && depth < 2 && (
        <div className="space-y-0">
          {reply.children.map((child) => (
            <DiscussionReply
              key={child.id}
              reply={child}
              clubId={clubId}
              discussionId={discussionId}
              currentUserId={currentUserId}
              isMember={isMember}
              myRole={myRole}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
