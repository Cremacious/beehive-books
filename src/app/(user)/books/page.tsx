import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CreateBookButton from '@/components/buttons/create-book-button';
import defaultCoverImage from '@/assets/stock/defaultBook.jpg';
import { Badge } from '@/components/ui/badge';

const userBooks = [
  {
    id: '1',
    title: 'The Honey Trail',
    author: 'Jane Writer',
    genre: 'Adventure',
    chapters: 12,
    privacy: 'Public',
    lastEditedBy: 'You',
    comments: 8,
    cover: '/default-book-cover.png',
    updatedAt: '2025-07-30',
  },
  {
    id: '2',
    title: 'Lord of the Rings: Fellowship of the Ring and More',
    author: 'Sam Bee',
    genre: 'Memoir',
    chapters: 8,
    privacy: 'Private',
    lastEditedBy: 'You',
    comments: 3,
    cover: '/default-book-cover.png',
    updatedAt: '2025-07-28',
  },
];

const friendsBooks = [
  {
    id: '3',
    title: 'Hive Mind',
    author: 'Alex Friend',
    genre: 'Sci-Fi',
    chapters: 5,
    privacy: 'Public',
    lastEditedBy: 'Alex Friend',
    comments: 15,
    cover: '/default-book-cover.png',
    updatedAt: '2025-07-31',
  },
];

export default function BooksPage() {
  const totalBooks = userBooks.length;
  const totalFriendsBooks = friendsBooks.length;
  const totalChapters = userBooks.reduce((acc, b) => acc + b.chapters, 0);
  const totalComments =
    userBooks.reduce((acc, b) => acc + b.comments, 0) +
    friendsBooks.reduce((acc, b) => acc + b.comments, 0);

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

          <div className=" whiteContainer">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {totalBooks}
                </div>
                <div className="text-xs text-slate-600">My Books</div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {totalChapters}
                </div>

                <div className="text-xs text-slate-600">Chapters</div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {totalComments}
                </div>
                <div className="text-xs text-slate-600">Comments</div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {totalFriendsBooks}
                </div>
                <div className="text-xs text-slate-600">Friends Books</div>
              </div>
            </div>
            <div className="flex justify-center mt-4 w-full">
              <CreateBookButton full={true} />
            </div>
          </div>
        </div>

        <div className="whiteContainer">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 ">
            <h2 className="text-3xl font-bold text-slate-900 font-['Caveat',cursive] flex items-center gap-2">
              📖 My Books
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
            {userBooks.map((book) => (
              <div
                key={book.id}
                className="customDark2 hoverAnimate2 rounded-2xl shadow-lg p-5 flex flex-col items-center border-b-6 border-b-yellow-500 relative h-[400px]"
              >
                <div className="flex flex-col items-center flex-1 justify-between">
                  <div className="flex flex-col items-center">
                    <Image
                      src={defaultCoverImage}
                      alt={book.title}
                      width={112}
                      height={160}
                      className="rounded-lg border-3 border-yellow-400 mb-3 object-cover shadow-lg group-hover:scale-105 transition-transform"
                      style={{ aspectRatio: '7/10' }}
                      priority
                    />
                    <h3 className="font-bold text-lg text-yellow-100 mb-1 text-center poppins line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-yellow-300 text-sm mb-2">
                      by {book.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3 justify-center min-h-[2.5rem] items-start">
                    <Badge variant={'wood'}>{book.genre}</Badge>
                    <Badge variant={'wood'}>{book.privacy}</Badge>
                  </div>
                </div>

                <div className="flex gap-2 w-full justify-between items-center mt-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant={'secondary'}>Options</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/books/${book.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/books/${book.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/books/${book.id}/share`}> Share</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button asChild className="flex-1">
                    <Link href={`/books/${book.id}`}>Read</Link>
                  </Button>
                </div>
              </div>
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
              friendsBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-slate-900 rounded-xl shadow-lg p-5 flex flex-col items-center border-3 border-yellow-300 relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="absolute top-3 right-3 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity">
                    👥
                  </div>

                  <div className="flex flex-col items-center">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      width={112}
                      height={160}
                      className="rounded-lg border-3 border-yellow-400 mb-3 object-cover shadow-lg group-hover:scale-105 transition-transform"
                      style={{ aspectRatio: '7/10' }}
                      priority
                    />
                    <h3 className="font-bold text-xl text-yellow-100 mb-1 text-center font-['Caveat',cursive]">
                      {book.title}
                    </h3>
                    <p className="text-yellow-300 text-sm mb-2">
                      by {book.author}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3 justify-center">
                      <span className="bg-yellow-600/30 text-yellow-200 text-xs px-2 py-1 rounded-full border border-yellow-400/50">
                        {book.genre}
                      </span>
                      <span className="bg-yellow-600/30 text-yellow-200 text-xs px-2 py-1 rounded-full border border-yellow-400/50">
                        {book.chapters} chapters
                      </span>
                      <span className="bg-yellow-600/30 text-yellow-200 text-xs px-2 py-1 rounded-full border border-yellow-400/50">
                        {book.privacy}
                      </span>
                    </div>

                    <div className="text-xs text-yellow-400 mb-1 text-center">
                      💬 {book.comments} comments
                    </div>
                    <div className="text-xs text-yellow-400 mb-1 text-center">
                      ✏️ Last edited by {book.lastEditedBy}
                    </div>
                    <span className="text-xs text-yellow-400 mb-3 text-center">
                      📅 Updated {book.updatedAt}
                    </span>

                    <Link
                      href={`/books/${book.id}`}
                      className="bg-yellow-400 text-slate-900 font-semibold px-4 py-2 rounded-full border-2 border-slate-900 hover:bg-yellow-500 transition hover:scale-105 transform"
                    >
                      👁️ View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
