import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { CommentSection } from '@/components/library/comment-section';
import { getChapterWithContextAction } from '@/lib/actions/book.actions';

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;

  let data;
  try {
    data = await getChapterWithContextAction(chapterId);
  } catch {
    notFound();
  }

  const { chapter, prev, next, comments, currentUserId } = data;

  return (
    <div>
      <div className="border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between gap-3">
        <BackButton
          href={`/library/${bookId}`}
          label="Back"
          className="text-sm shrink-0"
        />

        <div className="text-center min-w-0">
          <p className="text-xs text-yellow-500 truncate">
            {chapter.collection ? chapter.collection.name : `Chapter ${chapter.order}`}
          </p>
          <h1 className="text-sm font-semibold text-white truncate leading-tight">
            {chapter.title}
          </h1>
        </div>

        <span className="text-xs text-white shrink-0">
          {chapter.wordCount.toLocaleString()} words
        </span>
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
          <RichTextEditor content={chapter.content} editable={false} />
        )}

        <div className="flex items-center justify-between gap-4 mt-14 pt-8 border-t border-[#2a2a2a]">
          {prev ? (
            <Link
              href={`/library/${bookId}/${prev.id}`}
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
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/library/${bookId}/${next.id}`}
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
          ) : (
            <div />
          )}
        </div>

        <CommentSection
          chapterId={chapterId}
          comments={comments}
          currentUserId={currentUserId ?? null}
        />
      </div>
    </div>
  );
}
