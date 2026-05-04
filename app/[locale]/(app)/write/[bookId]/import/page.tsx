import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ImportReviewClient } from '@/components/v2/import/import-review-client';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export const metadata: Metadata = {
  title: 'Import Manuscript',
  description: 'Import and review chapters for a Beehive Books project.',
};

export default async function ImportManuscriptPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book: Awaited<ReturnType<typeof getBookWithChaptersAction>>;
  try {
    book = await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  return <ImportReviewClient bookId={book.id} bookTitle={book.title} />;
}
