import Image from 'next/image';
import Link from 'next/link';
import type { Book } from '@/lib/types/books.types';

export default function BookCard({
  book,
  basePath = '/library',
}: {
  book: Book;
  basePath?: '/library' | '/books';
}) {
  return (
    <Link
      href={`${basePath}/${book.id}`}
      className="group flex flex-col rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-full aspect-2/3 overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[#1e1e1e] to-[#141414] flex items-center justify-center">
            <span className="text-4xl font-bold text-white/20 mainFont">
              {book.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#FFC300] transition-colors mainFont">
          {book.title}
        </h3>
        <p className="text-xs text-white/60 truncate mt-0.5">{book.author}</p>
        {book.genre && (
          <span className="mt-1.5 self-start text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-white/70 font-medium truncate max-w-full">
            {book.genre}
          </span>
        )}
      </div>
    </Link>
  );
}
