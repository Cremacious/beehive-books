import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, BookOpen, FileText, MessageSquare } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { ExpandableDescription } from '@/components/shared/expandable-description';
import { Button } from '@/components/ui/button';
import ChapterList from '@/components/library/chapter-list';
import { ShareBookButton } from '@/components/library/share-book-button';
import { CoverImageViewer } from '@/components/library/cover-image-viewer';
import { Badge } from '@/components/ui/badge';
import { getBookForViewAction } from '@/lib/actions/book.actions';
import { DRAFT_STATUS_LABELS } from '@/lib/types/books.types';
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

        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            <div className="flex w-40 mx-auto sm:mx-0 sm:w-40 shrink-0 aspect-2/3 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] items-center justify-center overflow-hidden relative">
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
                <BookOpen className="w-10 h-10 text-white/80" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 leading-tight mainFont">
                    {book.title}
                  </h1>
                  <p className="text-base text-white mt-1.5">
                    by {book.author}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <ShareBookButton bookId={book.id} isOwner={isOwner} />
                  {isOwner && (
                    <Button asChild size="sm">
                      <Link href={`/library/${book.id}/edit`}>
                        <Edit />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{book.genre}</Badge>
                <Badge variant="secondary">{book.category}</Badge>
                <Badge className="capitalize" variant="secondary">
                  {book.privacy.toLowerCase()}
                </Badge>
                {book.draftStatus !== 'COMPLETED' && (
                  <Badge variant="secondary">
                    {DRAFT_STATUS_LABELS[book.draftStatus]}
                  </Badge>
                )}
              </div>

              <ExpandableDescription text={book.description} />

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5">
                <div className="flex items-center gap-2 text-base text-white">
                  <FileText className="w-4 h-4 text-yellow-500" />
                  <span>{chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-2 text-base text-white">
                  <BookOpen className="w-4 h-4 text-yellow-500" />
                  <span>{book.wordCount.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-2 text-base text-white">
                  <MessageSquare className="w-4 h-4 text-yellow-500" />
                  <span>{book.commentCount} comments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex sm:hidden gap-2 mt-4">
            {isOwner && (
              <Button asChild className="flex-1">
                <Link href={`/library/${book.id}/edit`}>
                  <Edit />
                  Edit Book
                </Link>
              </Button>
            )}
            <ShareBookButton
              bookId={book.id}
              isOwner={isOwner}
              size="default"
              className="flex-1"
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
