import Link from 'next/link';
import { Button } from '@/components/ui/button';
// import BookDetailsHero from '@/components/books/book-details-hero';
import ChapterCard from '@/components/books/chapter-card';
import Image from 'next/image';
import beeWriting from '@/assets/site/beeWriting.png';
import { MoveLeft } from 'lucide-react';
import { getBookById } from '@/lib/actions/book.actions';
import { ChapterType } from '@/lib/types/books.type';
import { notFound } from 'next/navigation';
import { getBookWordCount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import defaultCoverImage from '@/assets/stock/defaultBook.jpg';
import { getAuthenticatedUser } from '@/lib/server-utils';

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  const book = await getBookById(bookId);
  if (!book) notFound();
  const chapters = book.chapters ?? [];

  const { user } = await getAuthenticatedUser();

  const isAuthor = user?.id === book.userId;

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="mb-4">
        <Button variant={'secondary'} asChild>
          <Link href="/books">
            <MoveLeft className="mr-2" />
            Back to Bookshelf
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <div className="darkContainer">
          <div className="flex flex-col lg:flex-row gap-8 mb-4 lightContainer">
            <div className="flex-shrink-">
              <div className="relative flex justify-center mt-2">
                <Image
                  src={
                    book.cover && book.cover !== ''
                      ? book.cover
                      : defaultCoverImage
                  }
                  alt={book.title}
                  width={280}
                  height={400}
                  className="rounded-2xl shadow-2xl object-cover"
                  style={{ aspectRatio: '7/10' }}
                  priority
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-yellow-400 mb-3 poppins drop-shadow-sm text-center">
                {book.title}
              </h1>
              <p className="text-2xl text-white mb-4 poppins text-center">
                by {book.author}
              </p>
              <p className="text-white text-lg leading-relaxed mb-6 text-center">
                {book.description !== '' ? book.description : 'No description'}
              </p>
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <Badge className="" variant={'wood'}>
                  {book.genre}
                </Badge>
                <Badge className="" variant={'public'}>
                  {book.category}
                </Badge>
                {/* <Badge className="" variant={'inProgress'}>
                  {book.status}
                </Badge> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="yellowAccent text-center">
                  <div className="text-2xl font-bold text-yellow-800">
                    {book.chapters.length}
                  </div>
                  <div className="text-yellow-800 font-bold">Chapters</div>
                </div>
                <div className="yellowAccent text-center">
                  <div className="text-2xl font-bold text-yellow-800">
                    {getBookWordCount(book).toLocaleString()}
                  </div>
                  <div className="text-yellow-800 font-bold">Words</div>
                </div>
                <div className="yellowAccent text-center">
                  <div className="text-2xl font-bold text-yellow-800 font-['Caveat',cursive]">
                    {book.comments.length}
                  </div>
                  <div className="text-yellow-800 font-bold">Comments</div>
                </div>
              </div>
              {/* <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Collaborators
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.collaborators.map((collaborator) => (
                    <span
                      key={
                        collaborator.id ?? collaborator.name ?? Math.random()
                      }
                      className="bg-yellow-100 border-b-2 border-b-yellow-400 text-slate-800 text-sm px-3 py-1 rounded-full"
                    >
                      👤 {collaborator.name ?? String(collaborator)}
                    </span>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="darkContainer">
          <div className="max-w-5xl mx-auto lightContainer">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-4xl font-bold text-yellow-400 flex items-center gap-2 drop-shadow-sm ">
                Chapters
              </h2>

              {chapters.length > 0 && (
                <Button asChild>
                  <Link href={`/books/${book.id}/chapters/create`}>
                    New Chapter
                  </Link>
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {chapters.length > 0 ? (
                chapters.map((chapter: ChapterType, index: number) => (
                  <ChapterCard
                    key={index}
                    chapter={chapter}
                    bookId={book.id.toString()}
                    isAuthor={isAuthor}
                  />
                ))
              ) : (
                <div className="mt-8 text-center py-12 bg-yellow-50 rounded-2xl border-2 border-yellow-200 border-dashed">
                  <div className="flex justify-center mb-2">
                    <Image
                      src={beeWriting}
                      alt="Bee Writing"
                      width={100}
                      height={100}
                      className="border-2 border-yellow-300 rounded-xl border-dashed"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 font-['Caveat',cursive]">
                    Ready to add more chapters?
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Keep your story buzzing with new adventures!
                  </p>
                  <Button asChild>
                    <Link href={`/books/${book.id}/chapters/create`}>
                      Add Your First Chapter
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
