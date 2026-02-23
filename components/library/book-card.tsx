import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Book } from '@/lib/types/books';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/library/${book.id}`}
      className="group flex flex-col rounded-xl bg-[#202020] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:bg-[#232323] transition-all duration-200"
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
          <BookOpen className="w-6 h-6 text-white/8" />
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1">
        <h3 className="text-xs font-semibold text-white/80 leading-snug line-clamp-2 group-hover:text-[#FFC300] transition-colors duration-200">
          {book.title}
        </h3>
        <p className="text-[10px] text-white/30 truncate">{book.author}</p>

        <div className="mt-auto pt-2.5 flex items-center justify-between gap-1">
          <span className="px-1.5 py-0.5 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-[9px] font-medium truncate max-w-[70%]">
            {book.genre}
          </span>
          <span className="text-[9px] text-white/20 shrink-0">
            {book.chapterCount} ch
          </span>
        </div>
      </div>
    </Link>
  );
}
