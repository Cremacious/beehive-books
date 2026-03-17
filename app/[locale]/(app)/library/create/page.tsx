import type { Metadata } from 'next';
import { BookForm } from '@/components/library/book-form';

export const metadata: Metadata = {
  title: 'New Book',
  description: 'Create a new book in your Beehive Books library.',
};

export default function CreateBookPage() {
  return <BookForm mode="create" cancelHref="/library" />;
}
