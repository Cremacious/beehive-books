'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Edit } from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type { ClubReadingListBook, BookStatus } from '@/lib/types/club.types';

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'Currently reading' },
  { value: 'COMPLETED', label: 'Completed' },
];

const STATUS_LABEL: Record<BookStatus, string | null> = {
  NOT_STARTED: null,
  IN_PROGRESS: 'Reading',
  COMPLETED: 'Done',
};

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

  const statusLabel = STATUS_LABEL[book.status];

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#2a2a2a] last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium leading-snug ${
              book.status === 'COMPLETED'
                ? 'text-white/80 line-through decoration-white/50'
                : 'text-white'
            }`}
          >
            {book.title}
          </p>
          {statusLabel && (
            <span className="bg-[#2a2a2a] text-white/80 text-xs px-2 py-0.5 rounded-full">
              {statusLabel}
            </span>
          )}
        </div>
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
              className="flex items-center gap-1 px-2 py-1 rounded-md text-yellow-500 hover:bg-[#FFC300]/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  {label}
                  {book.status === value && (
                    <span className="text-yellow-500 text-xs font-medium">Active</span>
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
      <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] p-8 flex flex-col items-center text-center mb-4">
        <p className="text-sm font-semibold text-white mb-1">No books yet</p>
        <p className="text-sm text-white/80 max-w-sm">
          {isMod
            ? 'Add books using the form above to start building your reading list.'
            : 'This club has not added any books to their reading list yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] px-4 mb-4">
      {books.map((book) => (
        <BookRow key={book.id} book={book} clubId={clubId} isMod={isMod} />
      ))}
    </div>
  );
}
