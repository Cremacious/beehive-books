import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, BookOpen, FileText, MessageSquare, Globe, Lock } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { ExpandableDescription } from '@/components/shared/expandable-description';
import ChapterList from '@/components/library/chapter-list';
import { ShareBookButton } from '@/components/library/share-book-button';
import { CoverImageViewer } from '@/components/library/cover-image-viewer';
import { GeneratedCover } from '@/components/library/generated-cover';
import { getBookForViewAction } from '@/lib/actions/book.actions';
import { DRAFT_STATUS_LABELS, type DraftStatus } from '@/lib/types/books.types';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  try {
    const book = await getBookForViewAction(bookId);
    return {
      title: book.title,
      description: book.description
        ? book.description.slice(0, 155)
        : `Read ${book.title} on Beehive Books.`,
    };
  } catch {
    return { title: 'Book' };
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book;
  try {
    book = await getBookForViewAction(bookId);
  } catch {
    notFound();
  }

  const { chapters, collections, isOwner } = book;

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <BackButton href="/library" label="My Library" className="mb-6" />

        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] border-t-2 border-t-[#FFC300]/20 shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            {/* Cover */}
            <div className="flex w-40 mx-auto sm:mx-0 shrink-0 aspect-2/3 rounded-xl border border-[#2a2a2a] overflow-hidden relative">
              {book.coverUrl ? (
                <>
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                  <CoverImageViewer src={book.coverUrl} alt={book.title} />
                </>
              ) : (
                <GeneratedCover title={book.title} author={book.author} bookId={book.id} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mainFont">
                    {book.title}
                  </h1>
                  <p className="text-sm text-white/70 mt-1.5">
                    by {book.author}
                    {book.user?.username && (
                      <Link
                        href={`/u/${book.user.username}`}
                        className="ml-1 text-white/40 hover:text-[#FFC300] transition-colors"
                      >
                        ({book.user.username})
                      </Link>
                    )}
                  </p>
                </div>

                {/* Desktop action buttons */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <ShareBookButton bookId={book.id} isOwner={isOwner} />
                  {isOwner && (
                    <Link
                      href={`/library/${book.id}/edit`}
                      className="flex items-center gap-1.5 bg-[#FFC300]/10 border border-[#FFC300]/20 text-[#FFC300] hover:bg-[#FFC300]/20 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a2a2a] text-white/70 font-medium">
                  {book.genre}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a2a2a] text-white/70 font-medium">
                  {book.category}
                </span>
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#2a2a2a] text-white/70 font-medium capitalize">
                  {book.privacy === 'PRIVATE' && <Lock className="w-3 h-3" />}
                  {book.privacy === 'PUBLIC' && <Globe className="w-3 h-3" />}
                  {book.privacy.toLowerCase()}
                </span>
                {book.draftStatus !== 'COMPLETED' && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFC300]/10 text-[#FFC300] font-medium border border-[#FFC300]/20">
                    {DRAFT_STATUS_LABELS[book.draftStatus as DraftStatus]}
                  </span>
                )}
              </div>

              <ExpandableDescription text={book.description} />

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-1 mt-5">
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <FileText className="w-4 h-4 text-[#FFC300]/70" />
                  <span>{chapters.length} chapters</span>
                </div>
                <span className="text-white/20 mx-1">·</span>
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <BookOpen className="w-4 h-4 text-[#FFC300]/70" />
                  <span>{book.wordCount.toLocaleString()} words</span>
                </div>
                <span className="text-white/20 mx-1">·</span>
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <MessageSquare className="w-4 h-4 text-[#FFC300]/70" />
                  <span>{book.commentCount} comments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden flex-col gap-2 mt-5">
            {isOwner && (
              <Link
                href={`/library/${book.id}/edit`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#FFC300] text-black text-sm font-bold transition-colors hover:bg-[#FFD040]"
              >
                <Edit className="w-4 h-4" />
                Edit Book
              </Link>
            )}
            <ShareBookButton
              bookId={book.id}
              isOwner={isOwner}
              size="default"
              className="w-full rounded-full border border-[#2a2a2a] text-white"
            />
          </div>
        </div>

        <ChapterList
          bookId={bookId}
          chapters={chapters}
          collections={collections}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
