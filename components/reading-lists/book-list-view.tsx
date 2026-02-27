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
import { useReadingListStore } from '@/lib/stores/reading-list-store';
import type {
  BookListViewProps,
  ReadingListBook,
} from '@/lib/types/reading-list.types';

function BookRow({
  book,
  isOwner,
  optimisticRead,
  isCurrentlyReading,
  onToggleRead,
  onSetCurrentlyReading,
  onRemove,
}: {
  book: ReadingListBook;
  isOwner: boolean;
  optimisticRead: boolean;
  isCurrentlyReading: boolean;
  onToggleRead: () => void;
  onSetCurrentlyReading: () => void;
  onRemove: () => Promise<void>;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [removing, setRemoving] = useState(false);
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

  const handleRemove = async () => {
    setShowMenu(false);
    if (!confirm(`Remove "${book.title}" from this list?`)) return;
    setRemoving(true);
    await onRemove();
    setRemoving(false);
  };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#2a2a2a] last:border-0 group">
      <div className="shrink-0">
        {optimisticRead ? (
          <CheckCircle2 className="w-4 h-4 text-[#FFC300]" />
        ) : (
          <Circle className="w-4 h-4 text-white/70" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isCurrentlyReading && (
            <BookOpen className="w-3.5 h-3.5 text-[#FFC300] shrink-0" />
          )}
          <p
            className={`text-sm font-medium leading-snug transition-colors ${
              optimisticRead
                ? 'text-white/80 line-through decoration-white'
                : 'text-white'
            }`}
          >
            {book.title}
          </p>
        </div>
        <p className="text-sm text-white/80 truncate mt-0.5">{book.author}</p>
      </div>

      {isOwner && (
        <div
          className="relative shrink-0"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          {removing ? (
            <div className="p-1.5">
              <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
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
            <div className="absolute right-0 top-full mt-1 z-50 min-w-48 rounded-xl bg-[#1e1e1e] border border-[#333] shadow-xl py-1 overflow-hidden">
              <button
                onClick={() => {
                  onSetCurrentlyReading();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
              >
                <BookOpen
                  className={`w-4 h-4 shrink-0 ${
                    isCurrentlyReading ? 'text-[#FFC300]' : 'text-white/80'
                  }`}
                />
                {isCurrentlyReading
                  ? 'Remove from currently reading'
                  : 'Set as currently reading'}
              </button>

              <button
                onClick={() => {
                  onToggleRead();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
              >
                {optimisticRead ? (
                  <Circle className="w-3.5 h-3.5 shrink-0 text-white/80" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white/80" />
                )}
                Mark as {optimisticRead ? 'unread' : 'read'}
              </button>

              <div className="my-1 border-t border-[#2a2a2a]" />

              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
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

export function BookListView({
  books,
  listId,
  isOwner,
  currentlyReadingId,
}: BookListViewProps) {
  const router = useRouter();
  const store = useReadingListStore();

  const optimisticCR = store.optimisticCurrentlyReading[listId];
  const effectiveCRId =
    optimisticCR !== undefined ? optimisticCR : currentlyReadingId;

  const handleToggleRead = async (book: ReadingListBook) => {
    const current = store.optimisticReadStatus[book.id] ?? book.isRead;
    await store.toggleReadStatus(listId, book.id, current);
    router.refresh();
  };

  const handleSetCurrentlyReading = async (book: ReadingListBook) => {
    const isAlreadyCR = effectiveCRId === book.id;
    const newBookId = isAlreadyCR ? null : book.id;
    await store.setCurrentlyReading(listId, newBookId, effectiveCRId ?? null);
    router.refresh();
  };

  const handleRemove = async (book: ReadingListBook) => {
    const result = await store.removeBook(listId, book.id);
    if (result.success) router.refresh();
  };

  if (books.length === 0) {
    return (
      <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-8 flex flex-col items-center text-center mb-4">
        <BookOpen className="w-8 h-8 text-white/80 mb-3" />
        <p className="text-sm text-white/80">No books in this list yet.</p>
        {isOwner && (
          <p className="text-xs text-white/80 mt-1">
            Add books using the form below.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 mb-4">
      {books.map((book) => {
        const optimisticRead =
          store.optimisticReadStatus[book.id] ?? book.isRead;
        const isCurrentlyReading = effectiveCRId === book.id;
        return (
          <BookRow
            key={book.id}
            book={book}
            isOwner={isOwner}
            optimisticRead={optimisticRead}
            isCurrentlyReading={isCurrentlyReading}
            onToggleRead={() => handleToggleRead(book)}
            onSetCurrentlyReading={() => handleSetCurrentlyReading(book)}
            onRemove={() => handleRemove(book)}
          />
        );
      })}
    </div>
  );
}
