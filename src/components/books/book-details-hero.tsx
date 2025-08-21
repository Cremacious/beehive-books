import Image from 'next/image';
import { Badge } from '../ui/badge';
import { BookType } from '@/lib/types/books.type';
import defaultCoverImage from '@/assets/stock/defaultBook.jpg';
import { getBookWordCount } from '@/lib/utils';

export default function BookDetailsHero({ book }: { book: BookType }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-4 lightContainer">
      <div className="flex-shrink-0">
        <div className="relative flex justify-center mt-2">
          <Image
            src={
              book.cover && book.cover !== '' ? book.cover : defaultCoverImage
            }
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
        <h1 className="text-5xl font-bold text-yellow-400 mb-3 poppins drop-shadow-sm text-center">
          {book.title}
        </h1>
        <p className="text-2xl text-white mb-4 poppins text-center">
          by {book.author}
        </p>
        <p className="text-white text-lg leading-relaxed mb-6 text-center">
          {book.description !== '' ? book.description : 'No description'}
        </p>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="yellowAccent text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {book.chapters.length}
            </div>
            <div className="text-yellow-800 font-bold">Chapters</div>
          </div>
          <div className="yellowAccent text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {getBookWordCount(book).toLocaleString()}
            </div>
            <div className="text-yellow-800 font-bold">Words</div>
          </div>
          <div className="yellowAccent text-center">
            <div className="text-2xl font-bold text-yellow-800 font-['Caveat',cursive]">
              {book.comments.length}
            </div>
            <div className="text-yellow-800 font-bold">Comments</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
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
  );
}
