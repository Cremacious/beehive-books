import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, ChevronUp } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
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
      <div className="border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between gap-3">
        <BackButton
          href={`${basePath}/${bookId}`}
          label=""
          className="text-sm shrink-0"
        />

        <div className="text-center min-w-0">
          <p className="text-xs text-yellow-500 truncate">
            {chapter.collection ? chapter.collection.name : ``}
          </p>
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {chapter.title}
          </h1>
        </div>

        <span className="text-xs text-white shrink-0">
          {chapter.wordCount.toLocaleString()} words
        </span>
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-14 pt-8 border-t border-[#2a2a2a]">
          {prev ? (
            <Link
              href={`${basePath}/${bookId}/${prev.id}`}
              className="flex items-center gap-2 group w-full sm:w-auto rounded-xl border border-[#2a2a2a] px-4 py-3 sm:border-0 sm:px-0 sm:py-0 hover:border-[#FFC300]/20 sm:hover:border-0 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white group-hover:text-[#FFC300] transition-colors shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-yellow-500">Previous</p>
                {prev.collectionName && (
                  <p className="text-xs text-white/80 truncate">{prev.collectionName}</p>
                )}
                <p className="text-sm font-medium text-white group-hover:text-white truncate transition-colors">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          <Link
            href={`${basePath}/${bookId}`}
            className="flex items-center justify-center gap-2 group w-full sm:w-auto rounded-xl border border-[#2a2a2a] px-4 py-3 sm:border-0 sm:px-0 sm:py-0 hover:border-[#FFC300]/20 sm:hover:border-0 transition-colors sm:flex-col sm:gap-1"
          >
            <ChevronUp className="w-4 h-4 text-white group-hover:text-[#FFC300] transition-colors" />
            <p className="text-xs text-yellow-500">Back To Book</p>
            <p className="text-sm font-medium text-white group-hover:text-[#FFC300] truncate transition-colors sm:max-w-32 text-center">
              {book.title}
            </p>
          </Link>
          {next ? (
            <Link
              href={`${basePath}/${bookId}/${next.id}`}
              className="flex items-center justify-end gap-2 group w-full sm:w-auto rounded-xl border border-[#2a2a2a] px-4 py-3 sm:border-0 sm:px-0 sm:py-0 hover:border-[#FFC300]/20 sm:hover:border-0 transition-colors"
            >
              <div className="min-w-0 text-right">
                <p className="text-xs text-yellow-500">Next</p>
                {next.collectionName && (
                  <p className="text-xs text-white/80 truncate">{next.collectionName}</p>
                )}
                <p className="text-sm font-medium text-white group-hover:text-white truncate transition-colors">
                  {next.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white group-hover:text-[#FFC300] transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
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
