import { getAllUserBooks } from '@/lib/actions/book.actions';
import BookCard from '@/components/shared/Books/BookCard';

const BooksPage = async () => {
  const books = await getAllUserBooks();
  if (!books) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">No Books Found</h1>
      </div>
    );
  }
  return (
    <section>
      <div className="flex justify-center">
        <div className="bg-beeDark border-white border-8 container roundShadow p-4">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BooksPage;
