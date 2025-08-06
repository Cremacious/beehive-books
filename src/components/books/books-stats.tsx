import CreateBookButton from '../buttons/create-book-button';

export default function BooksStats({
  totalBooks,
  totalChapters,
  totalComments,
  totalFriendsBooks,
}: {
  totalBooks: number;
  totalChapters: number;
  totalComments: number;
  totalFriendsBooks: number;
}) {
  return (
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
  );
}
