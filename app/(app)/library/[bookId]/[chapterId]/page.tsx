'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Heart, MessageSquare, MoreHorizontal, Send,
  BookOpen,
} from 'lucide-react';
import {
  getBookById,
  getChapterById,
  getAdjacentChapters,
  getCommentsByChapterId,
} from '@/lib/sample/books.sample';
import type { Comment, Reply } from '@/lib/types/books';
import BackButton from '@/components/shared/back-button';

const BOOK_ID    = '1';
const CHAPTER_ID = 'ch3';

export default function ChapterReaderPage() {
  const book     = getBookById(BOOK_ID)!;
  const chapter  = getChapterById(BOOK_ID, CHAPTER_ID)!;
  const { prev, next } = getAdjacentChapters(BOOK_ID, CHAPTER_ID);
  const comments = getCommentsByChapterId(CHAPTER_ID);

  const [commentText, setCommentText] = useState('');

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#1e1e1e]/95 backdrop-blur border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between gap-3">
       <BackButton href={`/library/${book.id}`} label="" className="text-sm" />

        <div className="text-center min-w-0">
          <p className="text-xs text-yellow-500 truncate">
            Chapter {chapter.order}
          </p>
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {chapter.title}
          </h1>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-white mr-1 hidden sm:inline">
            {chapter.wordCount.toLocaleString()} words
          </span>
          <button className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
            {/* <MoreHorizontal className="w-4 h-4" /> */}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {chapter.authorNotes && (
          <div className="mb-8 rounded-xl border border-[#FFC300]/20 bg-[#FFC300]/6 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#FFC300]/70" />
              <span className="text-xs font-semibold text-[#FFC300]/80 uppercase tracking-wider">
                Author&apos;s Note
              </span>
            </div>
            <p className="text-sm text-white leading-relaxed italic">
              {chapter.authorNotes}
            </p>
          </div>
        )}
        {chapter.content && (
          <article
            className="text-white text-base leading-[1.9]
              [&_p]:mb-5
              [&_em]:text-white/60 [&_em]:italic
              [&_strong]:text-white [&_strong]:font-semibold
              [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
              [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
              [&_h3]:text-white/90 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
              [&_blockquote]:border-l-2 [&_blockquote]:border-[#FFC300]/30 [&_blockquote]:pl-4 [&_blockquote]:text-white/50 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        )}

  
        <div className="flex items-center justify-between gap-4 mt-14 pt-8 border-t border-[#2a2a2a]">
          {prev ? (
            <Link
              href={`/library/${book.id}/${prev.id}`}
              className="flex items-center gap-2 group"
            >
              <ChevronLeft className="w-4 h-4 text-white group-hover:text-[#FFC300] transition-colors shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-yellow-500">Previous</p>
                <p className="text-sm font-medium text-white group-hover:text-white truncate transition-colors">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/library/${book.id}/${next.id}`}
              className="flex items-center gap-2 text-right group"
            >
              <div className="min-w-0">
                <p className="text-xs text-yellow-500">Next</p>
                <p className="text-sm font-medium text-white group-hover:text-white truncate transition-colors">
                  {next.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white group-hover:text-[#FFC300] transition-colors shrink-0" />
            </Link>
          ) : <div />}
        </div>

     
        <section className="mt-14">
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/40" />
            {comments.length} Comments
          </h2>

       
          <div className="flex gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 ring-1 ring-[#FFC300]/20">
              <span className="text-[#FFC300] text-xs font-bold">S</span>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={2}
                placeholder="Leave a comment…"
                className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 pr-11 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
              />
              <button
                disabled={!commentText.trim()}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg text-white/25 hover:text-[#FFC300] disabled:opacity-30 disabled:hover:text-white/25 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

   
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

/* ─── Comment Item ────────────────────────────────────────────────────────── */

function CommentItem({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${comment.user.colorClass}`}>
          {comment.user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white/80">{comment.user.name}</span>
            <span className="text-xs text-white/30">{comment.createdAt}</span>
          </div>
          <p className="text-sm text-white/65 leading-relaxed">{comment.text}</p>
          <div className="flex items-center gap-4 mt-2">
            <button className={`flex items-center gap-1.5 text-xs transition-colors ${comment.likedByMe ? 'text-[#FFC300]' : 'text-white/30 hover:text-white/60'}`}>
              <Heart className={`w-3.5 h-3.5 ${comment.likedByMe ? 'fill-current' : ''}`} />
              {comment.likeCount}
            </button>
            <button
              onClick={() => setShowReply(r => !r)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>


      {comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-4">
          {comment.replies.map(reply => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}


      {showReply && (
        <div className="ml-11 mt-3 flex gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
            <span className="text-[#FFC300] text-[10px] font-bold">S</span>
          </div>
          <input
            autoFocus
            placeholder={`Reply to ${comment.user.name}…`}
            className="flex-1 rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
        </div>
      )}
    </div>
  );
}

function ReplyItem({ reply }: { reply: Reply }) {
  return (
    <div className="flex gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${reply.user.colorClass}`}>
        {reply.user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white/80">{reply.user.name}</span>
          <span className="text-xs text-white/30">{reply.createdAt}</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{reply.text}</p>
        <button className={`flex items-center gap-1 mt-1.5 text-[11px] transition-colors ${reply.likedByMe ? 'text-[#FFC300]' : 'text-white/25 hover:text-white/50'}`}>
          <Heart className={`w-3 h-3 ${reply.likedByMe ? 'fill-current' : ''}`} />
          {reply.likeCount}
        </button>
      </div>
    </div>
  );
}
