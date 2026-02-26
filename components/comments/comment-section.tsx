'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useCommentStore } from '@/lib/stores/comment-store';
import type {
  CommentUser,
  Reply,
  Comment,
  CommentSectionProps,
} from '@/lib/types/comment.types';

function displayName(user: CommentUser): string {
  if (user.username) return user.username;
  if (user.firstName || user.lastName)
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  return 'Anonymous';
}

function initials(user: CommentUser): string {
  return (user.username ?? displayName(user)).slice(0, 2).toUpperCase();
}

function CurrentUserAvatar({ className }: { className: string }) {
  const { user } = useUser();
  return (
    <Avatar
      imageUrl={user?.imageUrl ?? null}
      alt="You"
      fallback={(user?.username ?? 'Y').slice(0, 2).toUpperCase()}
      className={className}
    />
  );
}

function Avatar({
  imageUrl,
  alt,
  fallback,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  fallback: string;
  className: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        className={`rounded-full object-cover shrink-0 ${className}`}
        width={32}
        height={32}
      />
    );
  }
  return (
    <div className={`rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white ${className}`}>
      {fallback}
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function CommentSection({ chapterId, comments, currentUserId }: CommentSectionProps) {
  const router = useRouter();
  const { toggleLike, addComment, optimisticLikes } = useCommentStore();

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  async function handleSubmitComment() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const result = await addComment(chapterId, commentText.trim());
    setSubmitting(false);
    if (result.success) {
      setCommentText('');
      router.refresh();
    }
  }

  return (
    <section className="mt-14">
      <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-yellow-500" />
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {currentUserId && (
        <div className="flex gap-3 mb-8">
          <CurrentUserAvatar className="w-8 h-8 text-xs" />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment(); }}
              rows={2}
              placeholder="Leave a comment…"
              className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD54F] transition-colors"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            chapterId={chapterId}
            currentUserId={currentUserId}
            optimisticLikes={optimisticLikes}
            onToggleLike={toggleLike}
            onReplyAdded={() => router.refresh()}
          />
        ))}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  chapterId,
  currentUserId,
  optimisticLikes,
  onToggleLike,
  onReplyAdded,
}: {
  comment:        Comment;
  chapterId:      string;
  currentUserId:  string | null;
  optimisticLikes: Record<string, boolean>;
  onToggleLike:   (id: string, current: boolean) => Promise<void>;
  onReplyAdded:   () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addComment } = useCommentStore();

  const isLiked = optimisticLikes[comment.id] ?? comment.likedByMe;
  const displayedCount = comment.likeCount + (
    optimisticLikes[comment.id] !== undefined
      ? (optimisticLikes[comment.id] ? 1 : 0) - (comment.likedByMe ? 1 : 0)
      : 0
  );

  async function handleReply() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    const result = await addComment(chapterId, replyText.trim(), comment.id);
    setSubmitting(false);
    if (result.success) {
      setReplyText('');
      setShowReply(false);
      onReplyAdded();
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <Avatar
          imageUrl={comment.user.imageUrl}
          alt={displayName(comment.user)}
          fallback={initials(comment.user)}
          className="w-8 h-8 text-xs"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{displayName(comment.user)}</span>
            <span className="text-sm text-white">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-base text-white leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => currentUserId && onToggleLike(comment.id, isLiked)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-[#FFC300]' : 'text-white hover:text-white'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {displayedCount}
            </button>
            {currentUserId && (
              <button
                onClick={() => setShowReply(r => !r)}
                className="text-sm text-white hover:text-white transition-colors"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-4">
          {comment.replies.map(reply => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              optimisticLikes={optimisticLikes}
              onToggleLike={onToggleLike}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {showReply && (
        <div className="ml-11 mt-3 flex gap-2">
          <CurrentUserAvatar className="w-7 h-7 text-[10px]" />
          <input
            autoFocus
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
            placeholder={`Reply to ${displayName(comment.user)}…`}
            className="flex-1 rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || submitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD54F] transition-colors shrink-0"
          >
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            Reply
          </button>
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  optimisticLikes,
  onToggleLike,
  currentUserId,
}: {
  reply:           Reply;
  optimisticLikes: Record<string, boolean>;
  onToggleLike:    (id: string, current: boolean) => Promise<void>;
  currentUserId:   string | null;
}) {
  const isLiked = optimisticLikes[reply.id] ?? reply.likedByMe;
  const displayedCount = reply.likeCount + (
    optimisticLikes[reply.id] !== undefined
      ? (optimisticLikes[reply.id] ? 1 : 0) - (reply.likedByMe ? 1 : 0)
      : 0
  );

  return (
    <div className="flex gap-3">
      <Avatar
        imageUrl={reply.user.imageUrl}
        alt={displayName(reply.user)}
        fallback={initials(reply.user)}
        className="w-7 h-7 text-[10px]"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{displayName(reply.user)}</span>
          <span className="text-sm text-white">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-white leading-relaxed">{reply.content}</p>
        <button
          onClick={() => currentUserId && onToggleLike(reply.id, isLiked)}
          className={`flex items-center gap-1 mt-1.5 text-sm transition-colors ${isLiked ? 'text-[#FFC300]' : 'text-white hover:text-white'}`}
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          {displayedCount}
        </button>
      </div>
    </div>
  );
}
