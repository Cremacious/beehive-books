import Image from 'next/image';
import Link from 'next/link';
import defaultBookCover from '@/assets/stock/defaultBook.jpg';

const mockBook = {
  id: '1',
  title: 'The Honey Trail',
  author: 'Jane Writer',
  genre: 'Adventure',
  description:
    'A thrilling adventure through the mystical honey trails of the ancient forest. Follow our hero as they discover the secrets of the golden nectar and the wisdom of the ancient bee kingdom.',
  privacy: 'Public',
  status: 'In Progress',
  chapters: 12,
  totalWords: 45230,
  comments: 8,
  likes: 23,
  cover: defaultBookCover,
  createdAt: '2025-07-15',
  updatedAt: '2025-07-30',
  tags: ['Adventure', 'Fantasy', 'Nature'],
  collaborators: ['Jane Writer', 'Sam Editor'],
};

const mockChapters = [
  {
    id: '1',
    title: 'The Discovery',
    excerpt:
      'It was a golden morning when Maya first stumbled upon the hidden path...',
    wordCount: 3250,
    status: 'Published',
    comments: 2,
    updatedAt: '2025-07-30',
  },
  {
    id: '2',
    title: 'The Ancient Grove',
    excerpt:
      'The trees whispered secrets as Maya ventured deeper into the forest...',
    wordCount: 4100,
    status: 'Published',
    comments: 3,
    updatedAt: '2025-07-28',
  },
  {
    id: '3',
    title: 'Meeting the Guardian',
    excerpt:
      'A massive golden bee emerged from the shadows, its wings shimmering...',
    wordCount: 3850,
    status: 'Draft',
    comments: 1,
    updatedAt: '2025-07-25',
  },
  {
    id: '4',
    title: 'The Honey Trials',
    excerpt:
      'Three challenges awaited Maya, each more difficult than the last...',
    wordCount: 0,
    status: 'Outline',
    comments: 0,
    updatedAt: '2025-07-20',
  },
];

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const bookId = (await params).bookId;

  console.log('Loading book with ID:', bookId);
  const book = mockBook;
  const chapters = mockChapters;

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="darkContainer">
        <div className="mb-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
          >
            ← Back to Bookshelf
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-10 whiteContainer">
          <div className="flex-shrink-0">
            <div className="relative">
              <Image
                src={book.cover}
                alt={book.title}
                width={280}
                height={400}
                className="rounded-2xl shadow-2xl object-cover"
                style={{ aspectRatio: '7/10' }}
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-yellow-700 mb-3 font-['Caveat',cursive] drop-shadow-sm">
                  {book.title}
                </h1>
                <p className="text-2xl text-slate-600 mb-4 font-['Caveat',cursive]">
                  by {book.author}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {book.genre}
                  </span>
                  <span className="bg-slate-100 border-2 border-slate-300 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {book.privacy}
                  </span>
                  <span className="bg-green-100 border-2 border-green-300 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {book.status}
                  </span>
                </div>

                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  {book.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                      {book.chapters}
                    </div>
                    <div className="text-xs text-slate-600">Chapters</div>
                  </div>
                  <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                      {book.totalWords.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">Words</div>
                  </div>
                  <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                      {book.comments}
                    </div>
                    <div className="text-xs text-slate-600">Comments</div>
                  </div>
                  <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                      {book.likes}
                    </div>
                    <div className="text-xs text-slate-600">Likes</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Collaborators
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {book.collaborators.map((collaborator) => (
                      <span
                        key={collaborator}
                        className="bg-yellow-100 border-b-2 border-b-yellow-400 text-slate-800 text-sm px-3 py-1 rounded-full"
                      >
                        👤 {collaborator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="flex flex-wrap gap-3 mt-6">
                <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition border-2 border-slate-900 hover:scale-105 transform">
                  📖 Start Reading
                </button>
                <button className="bg-slate-900 text-yellow-100 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-slate-800 transition border-2 border-yellow-400 hover:scale-105 transform">
                  ✏️ Edit Book
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-white text-slate-700 font-semibold px-6 py-3 rounded-full border-2 border-slate-300 hover:border-slate-400 transition hover:scale-105 transform">
                    More Actions
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>🔗 Share Book</DropdownMenuItem>
                    <DropdownMenuItem>💾 Download</DropdownMenuItem>
                    <DropdownMenuItem>📊 Analytics</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      🗑️ Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
            </div>
          </div>
        </div>

        <div className="pt-10 max-w-5xl mx-auto p-6 whiteContainer">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-['Caveat',cursive] flex items-center gap-2">
              Chapters
            </h2>
            <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition border-2 border-slate-900 hover:scale-105 transform w-fit">
              Add Chapter
            </button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-yellow-50  border-b-4 border-b-yellow-400 border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-yellow-400 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded-full text-sm border-2 border-slate-900">
                        Chapter {index + 1}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${
                          chapter.status === 'Published'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : chapter.status === 'Draft'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {chapter.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2 font-['Caveat',cursive] group-hover:text-yellow-700 transition-colors">
                      {chapter.title}
                    </h3>

                    <p className="text-slate-800 mb-3 leading-relaxed">
                      {chapter.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-800 ">
                      <span> {chapter.wordCount.toLocaleString()} words</span>
                      <span>{chapter.comments} comments</span>
                      <span>Updated {chapter.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button className="bg-yellow-400 text-slate-900 font-semibold px-4 py-2 rounded-full border-2 border-slate-900 hover:bg-yellow-500 transition hover:scale-105 transform">
                      📖 Read
                    </button>
                    <button className="bg-white text-slate-700 font-semibold px-4 py-2 rounded-full border-2 border-slate-300 hover:border-yellow-400 transition hover:scale-105 transform">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center py-12 bg-yellow-50 rounded-2xl border-2 border-yellow-200 border-dashed">
            <div className="text-4xl mb-3">🐝</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-['Caveat',cursive]">
              Ready to add more chapters?
            </h3>
            <p className="text-slate-700 mb-4">
              Keep your story buzzing with new adventures!
            </p>
            <button className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition border-2 border-slate-900 hover:scale-105 transform">
              Create New Chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
