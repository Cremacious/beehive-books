import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreateChapterButton from '@/components/buttons/create-chapter-button';
import BookDetailsHero from '@/components/books/book-details-hero';
// import { mockUser } from '@/lib/sampleData';
import ChapterCard from '@/components/books/chapter-card';
import Image from 'next/image';
import beeWriting from '@/assets/site/beeWriting.png';
import { MoveLeft } from 'lucide-react';
import { getBookById } from '@/lib/actions/book.actions';
import { ChapterType } from '@/lib/types/books.type';

export default async function BookPage({ params }: { params: { bookId: string } }) {
  // const book = mockUser.books[0];
  // const chapters = book ? book.chapters : [];

  const { bookId } = params;
  const book = await getBookById(bookId);
  const chapters = book?.chapters ?? [];
 

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="mb-6">
        <Button variant={'secondary'} asChild>
          <Link href="/books">
            <MoveLeft className="mr-2" />
            Back to Bookshelf
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <div className="darkContainer">
          <BookDetailsHero book={book} />
        </div>
        <div className="darkContainer">
          <div className="max-w-5xl mx-auto lightContainer">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-4xl font-bold text-yellow-400 flex items-center gap-2 drop-shadow-sm ">
                Chapters
              </h2>
              <Button asChild>
                <Link href={`/books/${book.id}/chapters/create`}>New Chapter</Link>
              </Button>
            </div>

            <div className="space-y-4">
                {chapters.map((chapter: ChapterType, index: number) => (
                <ChapterCard
                  key={index}
                  chapter={chapter}
                  index={index}
                  bookId={book.id.toString()}
                />
                ))}
            </div>

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
              <CreateChapterButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
