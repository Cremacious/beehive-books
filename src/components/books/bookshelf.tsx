import { BookType } from '@/lib/types/books.type';
import BookCard from './book-card';

export default function BookShelf({
  books,
  owner,
  editable,
}: {
  books: BookType[];
  owner: string;
  editable: boolean;
}) {
  return (
    <div className="lightContainer">
      <div className="flex justify-center mb-6">
        <div className="text-4xl font-bold text-yellow-400 caveatBrush flex items-center gap-2 text-center">
          {owner} Books
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6 bg-gradient-to-t from-yellow-200 via-yellow-100 to-yellow-200 px-2 py-6 md:p-6 rounded-xl">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard editable={editable} key={book.id} book={book} />
          ))
        ) : (
          <div className="col-span-full text-slate-800 text-center py-12 ">
            {/* <Image src={beeBookshelf} alt="Bee Bookshelf" width={200} height={200} /> */}
            <p className=" text-lg">
              Your bookshelf is empty. Start adding books!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
