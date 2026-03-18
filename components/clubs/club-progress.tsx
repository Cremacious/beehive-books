'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit2, Loader2, X, Check, BookMarked } from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type { ClubWithMembership } from '@/lib/types/club.types';
import { Button } from '../ui/button';

export default function ClubProgress({ club }: { club: ClubWithMembership }) {
  const router = useRouter();
  const store = useClubStore();
  const isMod = club.myRole === 'OWNER' || club.myRole === 'MODERATOR';
  const isMember = club.isMember;

  const [editingBook, setEditingBook] = useState(false);
  const [bookTitle, setBookTitle] = useState(club.currentBook ?? '');
  const [bookAuthor, setBookAuthor] = useState(club.currentBookAuthor ?? '');
  const [savingBook, setSavingBook] = useState(false);
  const [bookError, setBookError] = useState('');

  const [editingProgress, setEditingProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(String(club.currentPage ?? 0));
  const [totalPages, setTotalPages] = useState(String(club.totalPages ?? ''));
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressError, setProgressError] = useState('');

  const computedPercent =
    totalPages && Number(totalPages) > 0
      ? Math.min(
          100,
          Math.round((Number(currentPage) / Number(totalPages)) * 100),
        )
      : 0;

  const handleSaveBook = async () => {
    if (!bookTitle.trim()) return;
    setSavingBook(true);
    setBookError('');
    const result = await store.updateCurrentBook(
      club.id,
      bookTitle.trim(),
      bookAuthor.trim(),
    );
    setSavingBook(false);
    if (result.success) {
      setEditingBook(false);
      router.refresh();
    } else {
      setBookError(result.message);
    }
  };

  const handleCancelBook = () => {
    setEditingBook(false);
    setBookTitle(club.currentBook ?? '');
    setBookAuthor(club.currentBookAuthor ?? '');
    setBookError('');
  };

  const handleSaveProgress = async () => {
    const page = Number(currentPage);
    const total = Number(totalPages);
    if (!total || total < 1 || page < 0 || page > total) {
      setProgressError('Enter a valid page number and total pages.');
      return;
    }
    setSavingProgress(true);
    setProgressError('');
    const result = await store.updateProgress(club.id, page, total);
    setSavingProgress(false);
    if (result.success) {
      setEditingProgress(false);
      router.refresh();
    } else {
      setProgressError(result.message);
    }
  };

  const handleCancelProgress = () => {
    setEditingProgress(false);
    setCurrentPage(String(club.currentPage ?? 0));
    setTotalPages(String(club.totalPages ?? ''));
    setProgressError('');
  };

  return (
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#FFC300]" />
          <h3 className="text-sm font-semibold text-white">
            Current Club Book
          </h3>
        </div>
        {isMod && !editingBook && !editingProgress && (
          <Button
            onClick={() => setEditingBook(true)}
            variant="outline"
            size="sm"
          >
            <BookMarked className="w-4 h-4 text-[#FFC300]" />
            Change Book
          </Button>
        )}
      </div>

      {editingBook && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/80 mb-1">
              Book Title
            </label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. The Name of the Wind"
              className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/80 mb-1">Author</label>
            <input
              type="text"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              placeholder="e.g. Patrick Rothfuss"
              className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          <p className="text-sm text-white/80">
            Tip: set a book to &quot;Currently Reading&quot; in the reading list
            to auto-sync here.
          </p>
          {bookError && <p className="text-xs text-red-400">{bookError}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveBook}
              disabled={savingBook || !bookTitle.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#e0ac01] disabled:opacity-50 transition-colors"
            >
              {savingBook ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelBook}
              disabled={savingBook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-white/80 text-sm hover:text-white hover:border-[#2a2a2a] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingProgress && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-white/80 mb-1">
                Current Page
              </label>
              <input
                type="number"
                min={0}
                max={Number(totalPages) || undefined}
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                placeholder="e.g. 120"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-white/80 mb-1">
                Total Pages
              </label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="e.g. 662"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
            </div>
          </div>

          {Number(totalPages) > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/80">Preview</span>
                <span className="text-xs font-semibold text-[#FFC300]">
                  {computedPercent}%
                </span>
              </div>
              <div className="w-full bg-[#1e1e1e] rounded-full h-2">
                <div
                  className="bg-[#FFC300] h-2 rounded-full transition-all"
                  style={{ width: `${computedPercent}%` }}
                />
              </div>
            </div>
          )}

          {progressError && (
            <p className="text-xs text-red-400">{progressError}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveProgress}
              disabled={savingProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#e0ac01] disabled:opacity-50 transition-colors"
            >
              {savingProgress ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelProgress}
              disabled={savingProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-white/80 text-xs hover:text-white hover:border-[#2a2a2a] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {!editingBook && !editingProgress && (
        <div>
          {club.currentBook ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {club.currentBook}
                  </p>
                  {club.currentBookAuthor && (
                    <p className="text-xs text-white/80 truncate mt-0.5">
                      by {club.currentBookAuthor}
                    </p>
                  )}
                </div>
                {isMember && !editingProgress && (
                  <button
                    onClick={() => setEditingProgress(true)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm  hover:text-[#FFC300] hover:bg-[#FFC300]/10 border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-all font-semibold text-white"
                  >
                    <Edit2 className="w-4 h-4 text-[#FFC300]" />
                    Update Progress
                  </button>
                )}
              </div>

              <div className="w-full bg-[#1e1e1e] rounded-full h-2 mb-1.5">
                <div
                  className="bg-[#FFC300] h-2 rounded-full transition-all"
                  style={{ width: `${club.progressPercent ?? 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/80">
                {club.totalPages ? (
                  <span>
                    Page {club.currentPage} of {club.totalPages}
                  </span>
                ) : (
                  <span />
                )}
                <span className="font-semibold text-[#FFC300]">
                  {club.progressPercent ?? 0}%
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
                <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
              </div>
              <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
                No book selected!
              </h2>
              <p className="text-white/80 mb-8 max-w-sm">
                Choose a book for the club to read together and track everyone&apos;s
                progress.
              </p>
              {isMod && (
                <Button size="lg" onClick={() => setEditingBook(true)}>
                  <Edit2 className="w-5 h-5" />
                  Set Current Book
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
