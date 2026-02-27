'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit2, Loader2, X, Check } from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type { ClubWithMembership } from '@/lib/types/club.types';
import { Button } from '../ui/button';

export default function ClubProgress({ club }: { club: ClubWithMembership }) {
  const router = useRouter();
  const store = useClubStore();
  const isOwner = club.myRole === 'OWNER';

  const [editing, setEditing] = useState(false);
  const [bookTitle, setBookTitle] = useState(club.currentBook ?? '');
  const [bookAuthor, setBookAuthor] = useState(club.currentBookAuthor ?? '');
  const [percent, setPercent] = useState(club.progressPercent ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await store.updateProgress(
      club.id,
      percent,
      bookTitle.trim() || undefined,
      bookAuthor.trim() || undefined,
    );
    setSaving(false);
    if (result.success) {
      setEditing(false);
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setBookTitle(club.currentBook ?? '');
    setBookAuthor(club.currentBookAuthor ?? '');
    setPercent(club.progressPercent ?? 0);
    setError('');
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
        {isOwner && !editing && (
          <Button onClick={() => setEditing(true)} variant="outline">
            {' '}
            Update
            <Edit2 className="w-5 h-5 text-yellow-500" />
          </Button>
        )}
      </div>

      {editing ? (
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
              className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/80 mb-1">Author</label>
            <input
              type="text"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              placeholder="e.g. Patrick Rothfuss"
              className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/80 mb-1">
              Progress — {percent}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-[#FFC300]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#e0ac01] disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3a3a3a] text-white/80 text-xs hover:text-white hover:border-[#4a4a4a] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {club.currentBook ? (
            <>
              <div className="flex items-center justify-between mb-2">
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
                {/* {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="ml-3 p-2 rounded-lg text-white/60 hover:text-[#FFC300] hover:bg-[#FFC300]/10 transition-all shrink-0"
                    title="Update reading progress"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )} */}
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#1e1e1e] rounded-full h-2">
                  <div
                    className="bg-[#FFC300] h-2 rounded-full transition-all"
                    style={{ width: `${club.progressPercent ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-white/80 mt-1.5 text-right">
                  {club.progressPercent ?? 0}% complete
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                No book selected
              </h4>
              <p className="text-xs text-white/80 mb-4 max-w-xs">
                Set a book for your club to track reading progress and keep
                everyone on the same page.
              </p>
              {isOwner && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#e0ac01] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Set Current Book
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
