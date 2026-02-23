import { BookForm } from '@/components/library/book-form';

export default function CreateBookPage() {
  return <BookForm mode="create" cancelHref="/library" />;
}
