import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Share2, BookOpen, FileText, MessageSquare } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { Button } from '@/components/ui/button';
import ChapterList from '@/components/library/chapter-list';
import { Badge } from '@/components/ui/badge';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book;
  try {
    book = await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  const { chapters, collections } = book;

  return (
    <div className="px-4 py-6 md:px-8">
      <BackButton href="/library" label="My Library" className="mb-6" />

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 mb-6">
        <div className="flex gap-5">
          <div className="hidden sm:flex w-28 shrink-0 aspect-2/3 rounded-xl bg-[#1e1e1e] border border-[#333] items-center justify-center overflow-hidden relative">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
            ) : (
              <BookOpen className="w-8 h-8 text-white/10" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-yellow-500 leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-white mt-1">by {book.author}</p>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button variant={'outline'} asChild size="sm">
                  <Link href={`/library/${book.id}/share`}>
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/library/${book.id}/edit`}>
                    <Edit />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{book.genre}</Badge>
              <Badge variant="secondary">{book.category}</Badge>
              <Badge className='capitalize' variant="secondary">{book.privacy.toLowerCase()}</Badge>
             
            </div>

            <p className="text-sm text-white mt-3 leading-relaxed line-clamp-3">
              {book.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-white">
                <FileText className="w-3.5 h-3.5" />
                <span>{chapters.length} chapters</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{book.wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{book.commentCount} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden gap-2 mt-4">
          <Button asChild className="flex-1">
            <Link href={`/library/${book.id}/edit`}>
              <Edit />
              Edit Book
            </Link>
          </Button>
          <Button variant="outline" size="icon-sm">
            <Share2 />
          </Button>
        </div>
      </div>

      <ChapterList
        bookId={bookId}
        chapters={chapters}
        collections={collections}
      />
    </div>
  );
}
