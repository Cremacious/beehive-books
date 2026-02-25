import Link from 'next/link';
import { Plus } from 'lucide-react';
import BookGrid from '@/components/library/book-grid';
import { Button } from '@/components/ui/button';
import { getUserBooksAction } from '@/lib/actions/book.actions';

// TODO: Allow users to make a custom book order.
//TODO: Make 5 books the limit for free users

export default async function LibraryPage() {
  const books = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My Library
          </h1>
          <p className="mt-1 text-base text-white/45">
            Your creative workspace
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/library/create">
            <Plus />
            New Book
          </Link>
        </Button>
      </div>
      <BookGrid books={books} />
    </div>
  );
}
