// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
import BookGallery from '@/components/shared/Books/BookGallery';
import { getAllUserBooks } from '@/lib/actions/book.actions';
import { Book} from '@/lib/types/Book';

const DashboardPage = async () => {
  const rawBooks = await getAllUserBooks();
  console.log('books', rawBooks);
  if (!rawBooks) {
    return <div>No books found</div>;
  }
  const books: Book[] = (rawBooks as Partial<Book>[]).map((book) => ({
    ...book,
    chapters: book.chapters ?? [],
  })) as Book[];

  return (
    <>
      <section className="mb-4">
        <div className="container justify-center mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              {' '}
              Card
            </div>
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              {' '}
              Card
            </div>
          </div>
        </div>
        <div className="flex-flex-col space-y-8 bg-beeDark p-8">
          <BookGallery books={books} />
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
