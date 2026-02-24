'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useCommentStore } from '@/lib/stores/comment-store';

type CommentUser = {
  username:  string | null;
  firstName: string | null;
  lastName:  string | null;
  imageUrl:  string | null;
};

type Reply = {
  id:        string;
  content:   string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user:      CommentUser;
};

type Comment = {
  id:        string;
  content:   string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user:      CommentUser;
  replies:   Reply[];
};

type Props = {
  chapterId:     string;
  comments:      Comment[];
  currentUserId: string | null;
};

function displayName(user: CommentUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.username ?? 'Anonymous';
}

function initials(user: CommentUser): string {
  const name = displayName(user);
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function CommentSection({ chapterId, comments, currentUserId }: Props) {
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
        <MessageSquare className="w-4 h-4 text-white/40" />
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {currentUserId && (
        <div className="flex gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 ring-1 ring-[#FFC300]/20">
            <span className="text-[#FFC300] text-xs font-bold">Y</span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment(); }}
              rows={2}
              placeholder="Leave a comment…"
              className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 pr-11 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg text-white/25 hover:text-[#FFC300] disabled:opacity-30 disabled:hover:text-white/25 transition-colors"
            >
              {submitting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
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
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white/60">
          {initials(comment.user)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white/80">{displayName(comment.user)}</span>
            <span className="text-xs text-white/30">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-white/65 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => currentUserId && onToggleLike(comment.id, isLiked)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? 'text-[#FFC300]' : 'text-white/30 hover:text-white/60'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likeCount}
            </button>
            {currentUserId && (
              <button
                onClick={() => setShowReply(r => !r)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
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
          <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
            <span className="text-[#FFC300] text-[10px] font-bold">Y</span>
          </div>
          <input
            autoFocus
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
            placeholder={`Reply to ${displayName(comment.user)}…`}
            className="flex-1 rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || submitting}
            className="p-1.5 rounded-lg text-white/25 hover:text-[#FFC300] disabled:opacity-30 transition-colors"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-white/60">
        {initials(reply.user)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white/80">{displayName(reply.user)}</span>
          <span className="text-xs text-white/30">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{reply.content}</p>
        <button
          onClick={() => currentUserId && onToggleLike(reply.id, isLiked)}
          className={`flex items-center gap-1 mt-1.5 text-[11px] transition-colors ${isLiked ? 'text-[#FFC300]' : 'text-white/25 hover:text-white/50'}`}
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          {reply.likeCount}
        </button>
      </div>
    </div>
  );
}
