import Image from 'next/image';
import Link from 'next/link';
import type { Book } from '@/lib/types/books.types';
import { GeneratedCover } from '@/components/library/generated-cover';

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
      className="group flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
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
          <GeneratedCover title={book.title} author={book.author} bookId={book.id} />
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#FFC300] transition-colors mainFont">
          {book.title}
        </h3>
        <p className="text-xs text-white/80 truncate mt-0.5">{book.author}</p>
        {book.genre && (
          <span className="mt-1.5 self-start text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-white/80 font-medium truncate max-w-full">
            {book.genre}
          </span>
        )}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {book.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-[#FFC300]/10 text-[#FFC300]/80 font-medium">
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#2a2a2a] text-white/50 font-medium">
                +{book.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
