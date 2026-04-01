import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { CommentSection } from '@/components/comments/comment-section';
import type { getChapterWithContextAction } from '@/lib/actions/book.actions';
import type { Comment } from '@/lib/types/comment.types';

type ChapterData = Awaited<ReturnType<typeof getChapterWithContextAction>>;

export function ChapterReader({
  bookId,
  data,
  basePath,
}: {
  bookId: string;
  data: ChapterData;
  basePath: '/library' | '/books';
}) {
  const { chapter, book, prev, next, comments, currentUserId } = data;

  return (
    <div>
      <div className="border-b border-[#2a2a2a] px-4 py-3 grid grid-cols-3 items-center gap-2">
        {/* Left */}
        <div className="flex items-center">
          <Link
            href={`${basePath}/${bookId}`}
            className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-yellow-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="hidden sm:inline">To Book</span>
          </Link>
        </div>

        {/* Center — always centered regardless of side widths */}
        <div className="text-center min-w-0">
          <p className="text-xs text-yellow-500 truncate">
            {chapter.collection ? chapter.collection.name : ''}
          </p>
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {chapter.title}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end">
          <span className="text-xs text-white/80 shrink-0">
            {chapter.wordCount.toLocaleString()} words
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
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
          <RichTextEditor content={chapter.content} editable={false} />
        )}

        <div className="mt-14 pt-8 border-t border-[#2a2a2a]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Previous */}
            {prev ? (
              <Link
                href={`${basePath}/${bookId}/${prev.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-3 hover:border-[#FFC300]/30 hover:bg-[#252525] transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-[#FFC300]/60 group-hover:text-[#FFC300] transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-0.5">Previous</p>
                  <p className="text-sm font-medium text-white group-hover:text-[#FFC300] transition-colors truncate leading-tight">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {/* Back to book — hidden on mobile, center on desktop */}
            <Link
              href={`${basePath}/${bookId}`}
              className="hidden sm:flex group flex-col items-center justify-center gap-1 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-3 hover:border-[#FFC300]/30 hover:bg-[#252525] transition-all text-center"
            >
              <BookOpen className="w-4 h-4 text-[#FFC300]/60 group-hover:text-[#FFC300] transition-colors" />
              <p className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate max-w-full">
                {book.title}
              </p>
            </Link>

            {/* Next */}
            {next ? (
              <Link
                href={`${basePath}/${bookId}/${next.id}`}
                className="group flex items-center justify-end gap-3 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-3 hover:border-[#FFC300]/30 hover:bg-[#252525] transition-all"
              >
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-0.5">Next</p>
                  <p className="text-sm font-medium text-white group-hover:text-[#FFC300] transition-colors truncate leading-tight">
                    {next.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#FFC300]/60 group-hover:text-[#FFC300] transition-colors shrink-0" />
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Mobile: back to book link below nav */}
          <Link
            href={`${basePath}/${bookId}`}
            className="sm:hidden mt-3 flex items-center justify-center gap-2 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] px-4 py-3 hover:border-[#FFC300]/30 hover:bg-[#252525] transition-all group"
          >
            <BookOpen className="w-4 h-4 text-[#FFC300]/60 group-hover:text-[#FFC300] transition-colors" />
            <p className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
              {book.title}
            </p>
          </Link>
        </div>

        {book.chapterCommentsEnabled && (
          <CommentSection
            chapterId={chapter.id}
            comments={comments as unknown as Comment[]}
            currentUserId={currentUserId ?? null}
          />
        )}
      </div>
    </div>
  );
}
