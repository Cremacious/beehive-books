import CreateBookButton from '../buttons/create-book-button';

export default function BooksStats({
  totalBooks,
  totalChapters,

}: {
  totalBooks: number;
  totalChapters: number;

}) {
  return (
    <div className=" lightContainer flex flex-col justify-between">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center yellowAccent">
          <div className="text-2xl font-bold text-yellow-800">{totalBooks}</div>
          <div className=" text-yellow-800 font-bold">My Book Count</div>
        </div>

        <div className="text-center yellowAccent">
          <div className="text-2xl font-bold text-yellow-800 ">
            {totalChapters}
          </div>

          <div className="text-yellow-800 font-bold">Chapters</div>
        </div>

        {/* <div className="text-center yellowAccent">
          <div className="text-2xl font-bold text-yellow-800 ">
            {totalComments}
          </div>
          <div className="text-yellow-800 font-bold">Comments</div>
        </div>

        <div className="text-center yellowAccent">
          <div className="text-2xl font-bold text-yellow-800 ">
            {totalFriendsBooks}
          </div>
          <div className="text-yellow-800 font-bold">Friends Books</div>
        </div> */}
      </div>
      <div className="flex justify-center my-4 w-full">
        <CreateBookButton full={true} />
      </div>
    </div>
  );
}
