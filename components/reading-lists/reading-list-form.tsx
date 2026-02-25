'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Trash2, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReadingListStore } from '@/lib/stores/reading-list-store';
import {
  readingListSchema,
  type ReadingListFormData,
  type BookEntryData,
} from '@/lib/validations/reading-list.schema';
import type { ReadingList } from '@/lib/types/reading-list.types';

interface ReadingListFormProps {
  mode: 'create' | 'edit';
  listId?: string;
  defaultValues?: Partial<ReadingList>;
}

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE', label: 'Private', desc: 'Only you can see this list' },
  { value: 'FRIENDS', label: 'Friends', desc: 'Visible to your friends' },
  { value: 'PUBLIC',  label: 'Public',  desc: 'Anyone can discover this list' },
] as const;

export function ReadingListForm({
  mode,
  listId,
  defaultValues,
}: ReadingListFormProps) {
  const router = useRouter();
  const store  = useReadingListStore();

  const [books, setBooks]                         = useState<BookEntryData[]>([]);
  const [bookTitle, setBookTitle]                 = useState('');
  const [bookAuthor, setBookAuthor]               = useState('');
  const [currentlyReadingIdx, setCurrentlyReadingIdx] = useState<number | null>(null);
  const [error, setError]                         = useState('');
  const [deleting, setDeleting]                   = useState(false);

  const form = useForm<ReadingListFormData>({
    resolver: zodResolver(readingListSchema),
    defaultValues: {
      title:       defaultValues?.title       ?? '',
      description: defaultValues?.description ?? '',
      privacy:     defaultValues?.privacy     ?? 'PRIVATE',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  function addBook() {
    if (!bookTitle.trim() || !bookAuthor.trim()) return;
    setBooks((prev) => [
      ...prev,
      { title: bookTitle.trim(), author: bookAuthor.trim() },
    ]);
    setBookTitle('');
    setBookAuthor('');
  }

  function removeBook(idx: number) {
    setBooks((prev) => prev.filter((_, i) => i !== idx));
    if (currentlyReadingIdx === idx) setCurrentlyReadingIdx(null);
    else if (currentlyReadingIdx !== null && currentlyReadingIdx > idx)
      setCurrentlyReadingIdx(currentlyReadingIdx - 1);
  }

  function toggleCurrentlyReading(idx: number) {
    setCurrentlyReadingIdx((prev) => (prev === idx ? null : idx));
  }

  const onSubmit = async (data: ReadingListFormData) => {
    setError('');

    if (mode === 'create') {
      const result = await store.createList(data, books, currentlyReadingIdx);
      if (result.success && result.listId) {
        router.push(`/reading-lists/${result.listId}`);
      } else {
        setError(result.message);
      }
    } else {
      const result = await store.updateList(listId!, data);
      if (result.success) {
        router.push(`/reading-lists/${listId}`);
      } else {
        setError(result.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this reading list? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await store.deleteList(listId!);
    if (result.success) {
      router.push('/reading-lists');
    } else {
      setError(result.message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          List Title <span className="text-red-400">*</span>
        </label>
        <input
          {...register('title')}
          placeholder="e.g. Fantasy Reads, Books to Read in 2025…"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.title && (
          <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Description{' '}
          <span className="text-white/70 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="What's this list about?"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Privacy
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div className="flex flex-col p-3 rounded-xl border border-[#2a2a2a] bg-[#252525] peer-checked:border-[#FFC300]/50 peer-checked:bg-[#FFC300]/8 transition-all">
                <span className="text-xs font-semibold text-white peer-checked:text-[#FFC300]">
                  {label}
                </span>
                <span className="text-[11px] text-white/70 mt-0.5 leading-tight">
                  {desc}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-400 mt-1">{errors.privacy.message}</p>
        )}
      </div>

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Add Books{' '}
            <span className="text-white/70 font-normal">(optional)</span>
          </label>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addBook(); }
                }}
                placeholder="Book title"
                className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addBook(); }
                }}
                placeholder="Author"
                className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
              <button
                type="button"
                onClick={addBook}
                disabled={!bookTitle.trim() || !bookAuthor.trim()}
                className="px-3 py-2 rounded-lg bg-[#FFC300]/15 text-[#FFC300] hover:bg-[#FFC300]/25 disabled:opacity-30 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {books.length > 0 ? (
              <>
                <p className="text-sm text-white px-0.5">
                  Tap the{' '}
                  <BookMarked className="w-5 h-5 inline text-[#FFC300]/60" />{' '}
                  icon to mark a book as currently reading.
                </p>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {books.map((book, idx) => {
                    const isCR = currentlyReadingIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isCR
                            ? 'bg-[#FFC300]/8 border-[#FFC300]/30'
                            : 'bg-[#1e1e1e] border-[#2a2a2a]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCurrentlyReading(idx)}
                          title={isCR ? 'Remove from currently reading' : 'Set as currently reading'}
                          className="shrink-0"
                        >
                          <BookMarked
                            className={`w-5 h-5 transition-colors ${
                              isCR ? 'text-[#FFC300]' : 'text-white/20 hover:text-white/50'
                            }`}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {book.title}
                          </p>
                          <p className="text-[12px] text-white/70 truncate">
                            {book.author}
                          </p>
                        </div>
                        {isCR && (
                          <span className="text-[12px] text-[#FFC300]/70 shrink-0">
                            Now reading
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeBook(idx)}
                          className="p-0.5 rounded text-white hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-white/25 text-center py-2">
                No books added yet — you can always add them later.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create List' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-all"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete List
          </button>
        )}
      </div>
    </form>
  );
}
