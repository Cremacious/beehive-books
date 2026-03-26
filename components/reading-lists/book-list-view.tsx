'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Trash2, Loader2, Edit, Crown } from 'lucide-react';
import { useReadingListStore } from '@/lib/stores/reading-list-store';
import { updateBookCommentaryAction } from '@/lib/actions/reading-list.actions';
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
  listId,
}: {
  book: ReadingListBook;
  isOwner: boolean;
  optimisticRead: boolean;
  isCurrentlyReading: boolean;
  onToggleRead: () => void;
  onSetCurrentlyReading: () => void;
  onRemove: () => Promise<void>;
  listId: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editingCommentary, setEditingCommentary] = useState(false);
  const [commentaryDraft, setCommentaryDraft] = useState(book.commentary ?? '');
  const [rankDraft, setRankDraft] = useState<string>(book.rank != null ? String(book.rank) : '');
  const menuRef = useRef<HTMLDivElement>(null);
  const commentaryRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (editingCommentary) commentaryRef.current?.focus();
  }, [editingCommentary]);

  const handleRemove = async () => {
    setShowMenu(false);
    if (!confirm(`Remove "${book.title}" from this list?`)) return;
    setRemoving(true);
    await onRemove();
    setRemoving(false);
  };

  const saveCommentary = async () => {
    setEditingCommentary(false);
    const rankVal = rankDraft.trim() !== '' ? parseInt(rankDraft, 10) : undefined;
    await updateBookCommentaryAction(listId, book.id, commentaryDraft, rankVal);
  };

  const saveRank = async () => {
    const rankVal = rankDraft.trim() !== '' ? parseInt(rankDraft, 10) : undefined;
    await updateBookCommentaryAction(listId, book.id, commentaryDraft, rankVal);
  };

  const displayRank = book.rank ?? null;

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#2a2a2a] last:border-0 group">
      {/* Rank */}
      <div className="shrink-0 w-8 flex flex-col items-center pt-0.5">
        {isOwner ? (
          <input
            type="number"
            min={1}
            value={rankDraft}
            onChange={(e) => setRankDraft(e.target.value)}
            onBlur={saveRank}
            placeholder="#"
            className="w-8 text-center text-sm font-bold text-yellow-500 bg-transparent border-none outline-none focus:underline placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : displayRank === 1 ? (
          <Crown className="w-4 h-4 text-yellow-500" />
        ) : displayRank != null ? (
          <span className="text-sm font-bold text-yellow-500">{displayRank}</span>
        ) : null}
      </div>

      {/* Read toggle */}
      <div className="shrink-0 mt-0.5">
        {optimisticRead ? (
          <CheckCircle2 className="w-4 h-4 text-yellow-500" />
        ) : (
          <Circle className="w-4 h-4 text-white/80" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium leading-snug ${
              optimisticRead
                ? 'text-white/80 line-through decoration-white/50'
                : 'text-white'
            }`}
          >
            {book.title}
          </p>
          {isCurrentlyReading && (
            <span className="bg-[#2a2a2a] text-white/80 text-xs px-2 py-0.5 rounded-full">
              Reading
            </span>
          )}
        </div>
        <p className="text-sm text-white/80 truncate mt-0.5">{book.author}</p>

        {/* Commentary */}
        {isOwner ? (
          editingCommentary ? (
            <textarea
              ref={commentaryRef}
              value={commentaryDraft}
              onChange={(e) => setCommentaryDraft(e.target.value)}
              onBlur={saveCommentary}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveCommentary();
                }
              }}
              placeholder="Why I included this..."
              rows={2}
              className="mt-1.5 w-full text-xs text-white/80 italic bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-2 py-1.5 resize-none outline-none focus:border-[#FFC300]/30 placeholder-white/20"
            />
          ) : (
            <p
              onClick={() => setEditingCommentary(true)}
              className="text-xs text-white/80 italic mt-1 cursor-text hover:text-white transition-colors"
            >
              {commentaryDraft || (
                <span className="text-white/30">Click to add commentary...</span>
              )}
            </p>
          )
        ) : (
          book.commentary && (
            <p className="text-xs text-white/80 italic mt-1">{book.commentary}</p>
          )
        )}
      </div>

      {isOwner && (
        <div
          className="relative shrink-0"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          {removing ? (
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
              <button
                onClick={() => {
                  onSetCurrentlyReading();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
              >
                {isCurrentlyReading
                  ? 'Remove from currently reading'
                  : 'Set as currently reading'}
              </button>

              <button
                onClick={() => {
                  onToggleRead();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
              >
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
      <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] p-8 flex flex-col items-center text-center mb-4">
        <p className="text-sm font-semibold text-white mb-1">No books yet</p>
        <p className="text-sm text-white/80 max-w-sm">
          {isOwner
            ? 'Add books using the form above to start building your reading list.'
            : 'This reading list is empty.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] px-4 mb-4">
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
            listId={listId}
          />
        );
      })}
    </div>
  );
}
