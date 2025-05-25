import BookCard from './BookCard';
import { Book } from '@/lib/types/Book';

const BookGallery = ({ books }: { books: Book[] }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
};

export default BookGallery;
