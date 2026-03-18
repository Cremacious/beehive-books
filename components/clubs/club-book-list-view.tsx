'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  Edit,
} from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type { ClubReadingListBook, BookStatus } from '@/lib/types/club.types';

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'Currently reading' },
  { value: 'COMPLETED', label: 'Completed' },
];

function StatusIcon({ status }: { status: BookStatus }) {
  if (status === 'COMPLETED')
    return <CheckCircle2 className="w-4 h-4 text-[#FFC300]" />;
  if (status === 'IN_PROGRESS')
    return <BookOpen className="w-4 h-4 text-[#FFC300]" />;
  return <Circle className="w-4 h-4 text-white/80" />;
}

function BookRow({
  book,
  clubId,
  isMod,
}: {
  book: ClubReadingListBook;
  clubId: string;
  isMod: boolean;
}) {
  const router = useRouter();
  const store = useClubStore();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showMenu]);

  const handleStatusChange = async (status: BookStatus) => {
    setShowMenu(false);
    setLoading(true);
    await store.updateBookStatus(clubId, book.id, status);
    setLoading(false);
    router.refresh();
  };

  const handleRemove = async () => {
    setShowMenu(false);
    if (!confirm(`Remove "${book.title}" from the reading list?`)) return;
    setLoading(true);
    await store.removeBook(clubId, book.id);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#2a2a2a] last:border-0 group">
      <div className="shrink-0">
        <StatusIcon status={book.status} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug transition-colors ${
            book.status === 'COMPLETED'
              ? 'text-white/80 line-through decoration-white'
              : 'text-white'
          }`}
        >
          {book.title}
        </p>
        <p className="text-xs text-white/80 truncate mt-0.5">{book.author}</p>
      </div>

      {isMod && (
        <div
          className="relative shrink-0"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="p-1.5">
              <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
            </div>
          ) : (
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-yellow-500 hover:text-[#e0ac01] hover:bg-[#FFC300]/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
          )}

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-48 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] shadow-xl py-1 overflow-hidden">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
                >
                  <StatusIcon status={value} />
                  {label}
                  {book.status === value && (
                    <span className="ml-auto text-[#FFC300] text-xs">✓</span>
                  )}
                </button>
              ))}
              <div className="my-1 border-t border-[#2a2a2a]" />
              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Remove from list
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ClubBookListViewProps {
  books: ClubReadingListBook[];
  clubId: string;
  isMod: boolean;
}

export function ClubBookListView({ books, clubId, isMod }: ClubBookListViewProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-8 flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
          <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
        </div>
        <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
          No books in this list yet!
        </h2>
        <p className="text-white/80 mb-8 max-w-sm">
          {isMod
            ? 'Add books using the form below to start building your club\'s reading list.'
            : 'This club hasn\'t added any books to their reading list yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 mb-4">
      {books.map((book) => (
        <BookRow key={book.id} book={book} clubId={clubId} isMod={isMod} />
      ))}
    </div>
  );
}
