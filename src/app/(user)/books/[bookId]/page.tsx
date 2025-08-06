import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreateChapterButton from '@/components/buttons/create-chapter-button';
import BookDetailsHero from '@/components/books/book-details-hero';
import { userBooks } from '@/lib/sampleData';
import ChapterCard from '@/components/books/chapter-card';

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const bookId = (await params).bookId;

  console.log('Loading book with ID:', bookId);
  const book = userBooks[0];
  const chapters = book ? book.chapters : [];

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="darkContainer">
        <div className="mb-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
          >
            ← Back to Bookshelf
          </Link>
        </div>

        <BookDetailsHero book={book} />

        <div className="pt-10 max-w-5xl mx-auto p-6 whiteContainer">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-['Caveat',cursive] flex items-center gap-2">
              Chapters
            </h2>
            <Button className="">Add Chapter</Button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <ChapterCard key={index} chapter={chapter} index={index} bookId={book.id.toString()} />
            ))}
          </div>
          <Link href={`/books/33/chapters/create`}>Create New Chapter</Link>

          <div className="mt-8 text-center py-12 bg-yellow-50 rounded-2xl border-2 border-yellow-200 border-dashed">
            <div className="text-4xl mb-3">🐝</div>
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
  );
}
