import { BookForm } from '@/components/library/book-form';

// Placeholder — replace with DB fetch using bookId param
const PLACEHOLDER_BOOK = {
  title:       'The Silent Garden',
  author:      'Sarah Mitchell',
  category:    'Fiction',
  genre:       'Literary Fiction',
  description: 'A story about silence, loss, and finding beauty in unexpected places.',
  privacy:     'PUBLIC',
  coverUrl:    null,
};

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return (
    <BookForm
      mode="edit"
      book={PLACEHOLDER_BOOK}
      cancelHref={`/library/${bookId}`}
    />
  );
}
