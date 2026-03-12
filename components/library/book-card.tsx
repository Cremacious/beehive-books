import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Book } from '@/lib/types/books.types';
import { DRAFT_STATUS_LABELS } from '@/lib/types/books.types';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/library/${book.id}`}
      className="group flex flex-col rounded-lg bg-[#181818] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200"
    >
      <div className="relative w-full aspect-2/3 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <BookOpen className="w-5 h-5 text-white/8" />
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 pt-3 pb-3 gap-1.5">
        <div>
          <h3 className="text-base font-semibold text-yellow-500 leading-snug line-clamp-2 group-hover:text-[#FFC300] transition-colors duration-200 mainFont">
            {book.title}
          </h3>
          <p className="text-sm text-white truncate mt-0.5">{book.author}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-1 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-sm font-medium truncate max-w-full">
            {book.genre}
          </span>
          <span className="px-2 py-1 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-sm font-medium truncate max-w-full">
            {book.category}
          </span>
  
        </div>
      </div>
    </Link>
  );
}
