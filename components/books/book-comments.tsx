'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import {
  addBookCommentAction,
  deleteBookCommentAction,
  likeBookCommentAction,
} from '@/lib/actions/book-comments.actions';
import type { BookComment } from '@/lib/actions/book-comments.actions';

interface BookCommentsProps {
  bookId: string;
  initialComments: BookComment[];
  currentUserId: string | null;
  isAuthenticated: boolean;
  currentUserUsername?: string | null;
  currentUserImage?: string | null;
}

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CommentAvatar({
  image,
  username,
  size,
}: {
  image: string | null;
  username: string | null;
  size: 'sm' | 'md';
}) {
  const px = size === 'sm' ? 24 : 32;
  const cls = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  const fallback = (username ?? '?')[0].toUpperCase();

  if (image) {
    return (
      <Image
        src={image}
        alt={username ?? 'user'}
        width={px}
        height={px}
        className={`${cls} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-[#FFC300]/15 flex items-center justify-center font-bold text-yellow-500 shrink-0`}
    >
      {fallback}
    </div>
  );
}

function CommentItem({
  comment,
  bookId,
  currentUserId,
  isAuthenticated,
  onDelete,
  onLikeToggle,
  onReplyAdded,
  isReply,
}: {
  comment: BookComment;
  bookId: string;
  currentUserId: string | null;
  isAuthenticated: boolean;
  onDelete: (id: string, parentId: string | null) => void;
  onLikeToggle: (id: string, liked: boolean, delta: number) => void;
  onReplyAdded: (parentId: string, newReply: BookComment) => void;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) return;
    const wasLiked = comment.isLiked;
    onLikeToggle(comment.id, !wasLiked, wasLiked ? -1 : 1);
    void likeBookCommentAction(comment.id);
  };

  const handleDelete = () => {
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteBookCommentAction(comment.id);
      if (result.success) {
        onDelete(comment.id, comment.parentId);
      }
      setDeleting(false);
    });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const result = await addBookCommentAction(bookId, replyText.trim(), comment.id);
      if (result.success && result.commentId) {
        const newReply: BookComment = {
          id: result.commentId,
          content: replyText.trim(),
          createdAt: new Date(),
          likeCount: 0,
          parentId: comment.id,
          author: { id: currentUserId!, username: currentUserUsername ?? null, image: currentUserImage ?? null },
          isLiked: false,
          canDelete: true,
          replies: [],
        };
        onReplyAdded(comment.id, newReply);
        setReplyText('');
        setShowReplyForm(false);
      }
    });
  };

  return (
    <div className={`flex gap-3 ${isReply ? '' : 'py-3 border-b border-[#2a2a2a] last:border-b-0'}`}>
      <CommentAvatar
        image={comment.author.image}
        username={comment.author.username}
        size={isReply ? 'sm' : 'md'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-medium text-white">
            {comment.author.username ?? 'Anonymous'}
          </span>
          <span className="text-xs text-white/80">&middot; {timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.isLiked
                ? 'text-yellow-500'
                : 'text-white/80 hover:text-white disabled:hover:text-white/80'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-yellow-500' : ''}`}
            />
            <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
          </button>
          {!isReply && isAuthenticated && (
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="text-xs text-white/80 hover:text-white transition-colors"
            >
              Reply
            </button>
          )}
          {comment.canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-white/80 hover:text-white transition-colors ml-auto"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-3 flex gap-2 items-start">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              maxLength={2000}
              className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 rounded-xl resize-none"
            />
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={handleReplySubmit}
                disabled={isPending || !replyText.trim()}
                className="bg-[#FFC300] text-black text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-50 transition-opacity"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reply'}
              </button>
              <button
                onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                className="text-xs text-white/80 hover:text-white transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-3 ml-2 border-l-2 border-[#2a2a2a] pl-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                bookId={bookId}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
                onDelete={onDelete}
                onLikeToggle={onLikeToggle}
                onReplyAdded={onReplyAdded}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookComments({
  bookId,
  initialComments,
  currentUserId,
  isAuthenticated,
  currentUserUsername,
  currentUserImage,
}: BookCommentsProps) {
  const [comments, setComments] = useState<BookComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    startTransition(async () => {
      const result = await addBookCommentAction(bookId, newComment.trim());
      if (result.success && result.commentId) {
        const added: BookComment = {
          id: result.commentId,
          content: newComment.trim(),
          createdAt: new Date(),
          likeCount: 0,
          parentId: null,
          author: { id: currentUserId!, username: currentUserUsername ?? null, image: currentUserImage ?? null },
          isLiked: false,
          canDelete: true,
          replies: [],
        };
        setComments((prev) => [...prev, added]);
        setNewComment('');
      }
    });
  };

  const handleDelete = (id: string, parentId: string | null) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
            : c,
        ),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleLikeToggle = (id: string, liked: boolean, delta: number) => {
    const update = (c: BookComment): BookComment => {
      if (c.id === id) return { ...c, isLiked: liked, likeCount: c.likeCount + delta };
      if (c.replies.length > 0) return { ...c, replies: c.replies.map(update) };
      return c;
    };
    setComments((prev) => prev.map(update));
  };

  const handleReplyAdded = (parentId: string, newReply: BookComment) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, newReply] } : c,
      ),
    );
  };

  const totalCount = comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Comments</h2>
        {totalCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#FFC300] text-black">
            {totalCount}
          </span>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment…"
              rows={3}
              maxLength={2000}
              className="bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 rounded-xl w-full resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isPending || !newComment.trim()}
                className="bg-[#FFC300] text-black text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50 transition-opacity flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Comment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/80">
          <Link href="/sign-in" className="text-yellow-500 hover:text-white transition-colors">
            Sign in
          </Link>{' '}
          to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <div className="py-8 text-center">
        <p className="text-sm font-medium text-white mb-1">No comments yet</p>
        <p className="text-xs text-white/80">Start the conversation — leave the first comment.</p>
      </div>
      ) : (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a] px-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              bookId={bookId}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              onDelete={handleDelete}
              onLikeToggle={handleLikeToggle}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
