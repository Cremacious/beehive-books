'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Heart, MessageSquare, MoreHorizontal, Send,
  BookOpen,
} from 'lucide-react';

const BOOK = {
  id:    '1',
  title: 'The Silent Garden',
};

const CHAPTER = {
  id:          'ch3',
  title:       'Old Letters',
  order:       3,
  wordCount:   4100,
  authorNotes: "This chapter was the hardest to write. Maya's discovery of the letters felt very personal to me — I've kept letters from my own grandmother that I've never read. I hope you feel the weight of that moment.",
  content: `
    <p>The attic smelled of cedar and forgotten decades. Maya pressed her palm against the low door and felt it give, the old wood swollen with summer humidity, resistant yet somehow eager to be opened.</p>
    <p>Inside, light arrived in thin bars through the gable vent, painting gold stripes across cardboard boxes and sheet-covered furniture. Her grandmother had kept everything. Maya had always known this — had grown up watching Nana refuse to throw away a single birthday card, a single theatre programme, a single ribbon from a Christmas past.</p>
    <p>The letters were in a shoebox on the third shelf. She almost missed them. They were tied with kitchen twine, the knot so old it had fused into something permanent, something that wasn't meant to be undone.</p>
    <p>She sat on the dusty floor and read the first one by the slanted light.</p>
    <p><em>Dearest Evelyn — I know you won't reply. I'm writing anyway because silence answers nothing, and I have had enough silence to last me into the next world and back.</em></p>
    <p>Maya turned the envelope over. No return address. Postmarked 1962.</p>
    <p>She read it three times before she noticed her hands were shaking.</p>
  `,
};

const PREV_CHAPTER = { id: 'ch2', title: 'First Light',   order: 2 };
const NEXT_CHAPTER = { id: 'ch4', title: 'The Photograph', order: 4 };

const PLACEHOLDER_COMMENTS = [
  {
    id: 'c1',
    user: { name: 'Riley Thompson', initials: 'RT', color: 'bg-purple-500/20 text-purple-300' },
    text: 'The line about silence answering nothing absolutely floored me. This is beautiful writing.',
    likes: 14,
    liked: false,
    timeAgo: '2h',
    replies: [
      {
        id: 'r1',
        user: { name: 'Jordan Lee', initials: 'JL', color: 'bg-blue-500/20 text-blue-300' },
        text: 'Agreed — that line is going to stay with me.',
        likes: 3,
        liked: false,
        timeAgo: '1h',
      },
    ],
  },
  {
    id: 'c2',
    user: { name: 'Avery Chen', initials: 'AC', color: 'bg-emerald-500/20 text-emerald-300' },
    text: 'I love that the knot "wasn\'t meant to be undone." The detail does so much work. Can\'t wait to read the rest.',
    likes: 8,
    liked: true,
    timeAgo: '5h',
    replies: [],
  },
];

export default function ChapterReaderPage() {
  const [commentText, setCommentText] = useState('');

  return (
    <div className="min-h-screen bg-[#1a1a1a]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={`/library/${BOOK.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{BOOK.title}</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="text-center min-w-0">
          <p className="text-xs text-white/35 truncate">
            Chapter {CHAPTER.order}
          </p>
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {CHAPTER.title}
          </h1>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-white/30 mr-1 hidden sm:inline">
            {CHAPTER.wordCount.toLocaleString()} words
          </span>
          <button className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Author's notes */}
        {CHAPTER.authorNotes && (
          <div className="mb-8 rounded-xl border border-[#FFC300]/20 bg-[#FFC300]/6 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#FFC300]/70" />
              <span className="text-xs font-semibold text-[#FFC300]/80 uppercase tracking-wider">
                Author&apos;s Note
              </span>
            </div>
            <p className="text-sm text-white/65 leading-relaxed italic">
              {CHAPTER.authorNotes}
            </p>
          </div>
        )}

        {/* Chapter content */}
        <article
          className="text-white/75 text-base leading-[1.9]
            [&_p]:mb-5
            [&_em]:text-white/60 [&_em]:italic
            [&_strong]:text-white [&_strong]:font-semibold
            [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
            [&_h3]:text-white/90 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
            [&_blockquote]:border-l-2 [&_blockquote]:border-[#FFC300]/30 [&_blockquote]:pl-4 [&_blockquote]:text-white/50 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: CHAPTER.content }}
        />

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4 mt-14 pt-8 border-t border-[#2a2a2a]">
          {PREV_CHAPTER ? (
            <Link
              href={`/library/${BOOK.id}/${PREV_CHAPTER.id}`}
              className="flex items-center gap-2 group"
            >
              <ChevronLeft className="w-4 h-4 text-white/30 group-hover:text-[#FFC300] transition-colors shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-white/30">Previous</p>
                <p className="text-sm font-medium text-white/60 group-hover:text-white truncate transition-colors">
                  {PREV_CHAPTER.title}
                </p>
              </div>
            </Link>
          ) : <div />}

          {NEXT_CHAPTER ? (
            <Link
              href={`/library/${BOOK.id}/${NEXT_CHAPTER.id}`}
              className="flex items-center gap-2 text-right group"
            >
              <div className="min-w-0">
                <p className="text-xs text-white/30">Next</p>
                <p className="text-sm font-medium text-white/60 group-hover:text-white truncate transition-colors">
                  {NEXT_CHAPTER.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#FFC300] transition-colors shrink-0" />
            </Link>
          ) : <div />}
        </div>

        {/* Comments */}
        <section className="mt-14">
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/40" />
            {PLACEHOLDER_COMMENTS.length} Comments
          </h2>

          {/* Comment input */}
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

          {/* Comment list */}
          <div className="space-y-6">
            {PLACEHOLDER_COMMENTS.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

/* ─── Comment Item ────────────────────────────────────────────────────────── */

type Comment = typeof PLACEHOLDER_COMMENTS[number];
type Reply   = Comment['replies'][number];

function CommentItem({ comment }: { comment: Comment }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div>
      {/* Main comment */}
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${comment.user.color}`}>
          {comment.user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white/80">{comment.user.name}</span>
            <span className="text-xs text-white/30">{comment.timeAgo}</span>
          </div>
          <p className="text-sm text-white/65 leading-relaxed">{comment.text}</p>
          <div className="flex items-center gap-4 mt-2">
            <button className={`flex items-center gap-1.5 text-xs transition-colors ${comment.liked ? 'text-[#FFC300]' : 'text-white/30 hover:text-white/60'}`}>
              <Heart className={`w-3.5 h-3.5 ${comment.liked ? 'fill-current' : ''}`} />
              {comment.likes}
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

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-4">
          {comment.replies.map(reply => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}

      {/* Reply input */}
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
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${reply.user.color}`}>
        {reply.user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white/80">{reply.user.name}</span>
          <span className="text-xs text-white/30">{reply.timeAgo}</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{reply.text}</p>
        <button className={`flex items-center gap-1 mt-1.5 text-[11px] transition-colors ${reply.liked ? 'text-[#FFC300]' : 'text-white/25 hover:text-white/50'}`}>
          <Heart className={`w-3 h-3 ${reply.liked ? 'fill-current' : ''}`} />
          {reply.likes}
        </button>
      </div>
    </div>
  );
}
