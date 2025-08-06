import Image from 'next/image';
import { Badge } from '../ui/badge';
import { BookType } from '@/lib/types/books.type';
import defaultCoverImage from '@/assets/stock/defaultBook.jpg';

export default function BookDetailsHero({ book }: { book: BookType }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-10 whiteContainer">
      <div className="flex-shrink-0">
        <div className="relative">
          <Image
            src={book.cover && book.cover !== '' ? book.cover : defaultCoverImage}
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
            <h1 className="text-5xl font-bold text-yellow-700 mb-3 poppins drop-shadow-sm">
              {book.title}
            </h1>
            <p className="text-2xl text-slate-600 mb-4 poppins">
              by {book.author}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="" variant={'wood'}>
                {book.genre}
              </Badge>
              <Badge className="" variant={'public'}>
                {book.privacy}
              </Badge>
              <Badge className="" variant={'inProgress'}>
                {book.status}
              </Badge>
            </div>

            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              {book.description !== '' ? book.description : 'No description'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {book.chapters.length}
                </div>
                <div className="text-xs text-slate-600">Chapters</div>
              </div>
              <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {book.wordCount}
                </div>
                <div className="text-xs text-slate-600">Words</div>
              </div>
              <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {book.comments.length}
                </div>
                <div className="text-xs text-slate-600">Comments</div>
              </div>
              {/* <div className="bg-yellow-50 border-b-2 border-b-yellow-400 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 font-['Caveat',cursive]">
                  {book.likes}
                </div>
                <div className="text-xs text-slate-600">Likes</div>
              </div> */}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Collaborators
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.collaborators.map((collaborator) => (
                  <span
                    key={collaborator.id ?? collaborator.name ?? Math.random()}
                    className="bg-yellow-100 border-b-2 border-b-yellow-400 text-slate-800 text-sm px-3 py-1 rounded-full"
                  >
                    👤 {collaborator.name ?? String(collaborator)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
