import { notFound } from 'next/navigation';
import { BookForm } from '@/components/library/book-form';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export default async function EditBookPage({
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

  return (
    <BookForm
      mode="edit"
      book={book}
      cancelHref={`/library/${bookId}`}
    />
  );
}
