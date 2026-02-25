import Link from 'next/link';
import { Plus } from 'lucide-react';
import BookGrid from '@/components/library/book-grid';
import { Button } from '@/components/ui/button';
import { getUserBooksAction } from '@/lib/actions/book.actions';

// TODO: Allow users to make a custom book order.

export default async function LibraryPage() {
  const books = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Library</h1>
          <p className="mt-0.5 text-sm text-white/45">
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
