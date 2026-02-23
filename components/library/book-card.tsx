import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { Book } from '@/lib/types/books';

function BookCard({ book }: { book: Book }) {
  return (
    <div className="group flex flex-col rounded-2xl bg-[#202020] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/20 transition-all duration-200">

      <Link href={`/library/${book.id}`} className="block">
        <div className="aspect-2/3 bg-[#252525] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <BookOpen className="w-8 h-8 text-white/10" />
            <span className="text-[10px] text-white/15 leading-tight line-clamp-3 font-medium">
              {book.title}
            </span>
          </div>
        </div>
      </Link>


      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#FFC300] transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-white/35 mt-0.5 truncate">{book.author}</p>
        </div>

        <span className="inline-block px-2 py-0.5 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-[10px] font-medium self-start truncate max-w-full">
          {book.genre}
        </span>

        <p className="text-[11px] text-white/25">
          {book.chapterCount} chapter{book.chapterCount !== 1 ? 's' : ''}
        </p>

        <Link
          href={`/library/${book.id}`}
          className="mt-auto w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-[#2e2e2e] hover:border-[#FFC300]/40 hover:text-[#FFC300] transition-all duration-200"
        >
          View Book
        </Link>
      </div>
    </div>
  );
}

export default BookCard;
