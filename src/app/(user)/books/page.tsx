import BooksStats from '@/components/books/books-stats';
import BookCard from '@/components/books/book-card';
import { userBooks, friendsBooks } from '@/lib/sampleData';



export default function BooksPage() {
  const totalBooks = userBooks.length;
  const totalFriendsBooks = friendsBooks.length;
  const totalChapters = userBooks.reduce((acc, b) => acc + b.chapters.length, 0);
  const totalComments =
    userBooks.reduce((acc, b) => acc + b.comments.length, 0) +
    friendsBooks.reduce((acc, b) => acc + b.comments.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="darkContainer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="whiteContainer">
            <h1 className="text-4xl font-bold text-yellow-700 mb-2 font-['Caveat',cursive] drop-shadow-sm">
              Your Bookshelf
            </h1>
            <p className="text-slate-700 text-lg max-w-2xl">
              Your personal library where stories bloom and community thrives.
              Share, create, and grow together!
            </p>
          </div>

          <BooksStats
            totalBooks={totalBooks}
            totalChapters={totalChapters}
            totalComments={totalComments}
            totalFriendsBooks={totalFriendsBooks}
          />
        </div>

        <div className="whiteContainer">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 ">
            <h2 className="text-3xl font-bold text-slate-900 font-['Caveat',cursive] flex items-center gap-2">
              📖 My Books
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
            {userBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 font-['Caveat',cursive] flex items-center gap-2">
            Latest Books from Friends
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {friendsBooks.length === 0 ? (
              <div className="col-span-full text-slate-500 text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="text-4xl mb-2">🐝</div>
                <p className="font-['Caveat',cursive] text-lg">
                  No new books from friends yet.
                </p>
                <p className="text-sm">
                  Invite friends to start sharing stories!
                </p>
              </div>
            ) : (
              friendsBooks.map((book) => <BookCard key={book.id} book={book} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
