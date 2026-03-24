import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Edit,
  BookOpen,
  FileText,
  MessageSquare,
  Globe,
  Lock,
} from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { ExpandableDescription } from '@/components/shared/expandable-description';
import { Button } from '@/components/ui/button';
import ChapterList from '@/components/library/chapter-list';
import { ShareBookButton } from '@/components/library/share-book-button';
import { CoverImageViewer } from '@/components/library/cover-image-viewer';
import { GeneratedCover } from '@/components/library/generated-cover';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getBookForViewAction } from '@/lib/actions/book.actions';
import { getBookReadStatusAction } from '@/lib/actions/reading.actions';
import { getBookLikeStatusAction } from '@/lib/actions/book-like.actions';
import { LikeButton } from '@/components/books/like-button';
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

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const isAuthenticated = !!session?.user?.id;

  let book;
  let readChapterIds: string[] = [];
  let likeStatus = { liked: false, likeCount: 0 };
  try {
    [book, readChapterIds, likeStatus] = await Promise.all([
      getBookForViewAction(bookId),
      isAuthenticated
        ? getBookReadStatusAction(bookId).catch(() => [] as string[])
        : Promise.resolve([] as string[]),
      getBookLikeStatusAction(bookId).catch(() => ({
        liked: false,
        likeCount: 0,
      })),
    ]);
  } catch {
    notFound();
  }

  const { chapters, collections, isOwner } = book;

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {isAuthenticated ? (
          <BackButton href="/library" label="My Library" className="mb-6" />
        ) : (
          <BackButton href="/explore" label="Explore" className="mb-6" />
        )}
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
              </div>

              <ExpandableDescription text={book.description} />

              {/* Stats row — desktop: includes LikeButton inline */}
              <div className="hidden sm:flex flex-wrap items-center gap-1 mt-5">
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
                <span className="text-white/20 mx-1">·</span>
                <LikeButton
                  bookId={book.id}
                  initialLiked={likeStatus.liked}
                  initialLikeCount={likeStatus.likeCount}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              {/* Stats row — mobile: no LikeButton (shown below) */}
              <div className="flex sm:hidden flex-wrap items-center gap-1 mt-5">
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

          <div className="flex sm:hidden flex-col gap-2 mt-4">
            <LikeButton
              bookId={book.id}
              initialLiked={likeStatus.liked}
              initialLikeCount={likeStatus.likeCount}
              isAuthenticated={isAuthenticated}
              className="w-full justify-center"
            />
            <div className="flex gap-2">
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
        </div>

        <ChapterList
          bookId={bookId}
          chapters={chapters}
          collections={collections}
          isOwner={isOwner}
          basePath="/books"
          readChapterIds={isAuthenticated ? readChapterIds : undefined}
        />
      </div>
    </div>
  );
}
