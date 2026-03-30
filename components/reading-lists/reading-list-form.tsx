'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, BookMarked, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { useReadingListStore } from '@/lib/stores/reading-list-store';
import { readingListSchema } from '@/lib/validations/reading-list.schema';
import type {
  ReadingListFormProps,
  ReadingListFormData,
  BookEntryData,
} from '@/lib/types/reading-list.types';

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE', label: 'Private', desc: 'Only you can see this list' },
  { value: 'FRIENDS', label: 'Friends', desc: 'Visible to your friends' },
  { value: 'PUBLIC', label: 'Public', desc: 'Anyone can discover this list' },
] as const;

export function ReadingListForm({
  mode,
  listId,
  defaultValues,
}: ReadingListFormProps) {
  const router = useRouter();
  const store = useReadingListStore();

  const [books, setBooks] = useState<BookEntryData[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [currentlyReadingIdx, setCurrentlyReadingIdx] = useState<number | null>(
    null,
  );
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);

  const form = useForm<ReadingListFormData>({
    resolver: zodResolver(readingListSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      curatorNote: defaultValues?.curatorNote ?? '',
      privacy: defaultValues?.privacy ?? 'PRIVATE',
      explorable: defaultValues?.explorable ?? false,
      tags: defaultValues?.tags ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library
  const explorableValue = watch('explorable');

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          List Title <span className="text-white/80 text-sm font-normal">(required)</span>
        </label>
        <p className="text-sm text-white/80">Give your list a name that captures its theme.</p>
        <input
          {...register('title')}
          placeholder="e.g. Fantasy Reads, Books to Read in 2025…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <p className="text-sm text-white/80 text-right">{watch('title')?.length ?? 0} / 100</p>
        {errors.title && (
          <p className="text-sm text-white/80">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Description{' '}
          <span className="text-white/80 text-sm font-normal">(optional)</span>
        </label>
        <p className="text-sm text-white/80">A sentence or two about what connects these books.</p>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="What's this list about?"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        <p className="text-sm text-white/80 text-right">{watch('description')?.length ?? 0} / 300</p>
        {errors.description && (
          <p className="text-sm text-white/80">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Curator&apos;s Note <span className="text-white/80 text-sm font-normal">(optional)</span>
        </label>
        <p className="text-sm text-white/80">A personal intro — the story behind this list.</p>
        <textarea
          {...register('curatorNote')}
          rows={3}
          maxLength={500}
          placeholder="A personal intro — the story behind this list, what connects these books..."
          className="bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 rounded-xl w-full resize-none"
        />
        <p className="text-sm text-white/80 text-right">{watch('curatorNote')?.length ?? 0} / 500</p>
      </div>

      <div>
        <label className="block text-base font-medium text-white mb-1.5">
          Tags <span className="text-white/80 text-sm font-normal">(up to 10)</span>
        </label>
        <TagInput
          value={tags}
          onChange={(next) => { setTags(next); setValue('tags', next); }}
          emptyMessage="No tags yet. Tags help readers find your book."
          error={errors.tags?.message}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Privacy
        </label>
        <p className="text-sm text-white/80">Public lists appear in Explore and can be followed by others.</p>
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
                <span className="text-sm font-semibold text-white peer-checked:text-[#FFC300]">
                  {label}
                </span>
                <span className="text-sm text-white/80 mt-0.5 leading-tight">
                  {desc}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-sm text-white/80">{errors.privacy.message}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl bg-[#252525] border border-[#2a2a2a] p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Compass className="w-4 h-4 text-[#FFC300]" />
            <span className="text-base font-medium text-white">Explorable</span>
          </div>
          <p className="text-sm text-white/80">
            List this reading list on the Explore page so all users can discover it.
            Enabling this will make the list public.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !explorableValue;
            setValue('explorable', next);
            if (next) setValue('privacy', 'PUBLIC');
          }}
          className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
            explorableValue ? 'bg-[#FFC300]' : 'bg-[#3a3a3a]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              explorableValue ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {mode === 'create' && (
        <div>
          <label className="block text-base font-medium text-white mainFont mb-1.5">
            Add Books{' '}
            <span className="text-white/80 font-normal">(optional)</span>
          </label>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBook();
                  }
                }}
                placeholder="Book title"
                className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBook();
                  }
                }}
                placeholder="Author"
                className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
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
                          title={
                            isCR
                              ? 'Remove from currently reading'
                              : 'Set as currently reading'
                          }
                          className="shrink-0"
                        >
                          <BookMarked
                            className={`w-5 h-5 transition-colors ${
                              isCR
                                ? 'text-[#FFC300]'
                                : 'text-white/80 hover:text-white/80'
                            }`}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-white truncate">
                            {book.title}
                          </p>
                          <p className="text-sm text-white/80 truncate">
                            {book.author}
                          </p>
                        </div>
                        {isCR && (
                          <span className="text-xs text-[#FFC300] shrink-0">
                            Now reading
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeBook(idx)}
                          className="p-0.5 rounded text-white hover:text-white/80 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-white/80 text-center py-2">
                No books added yet. You can always add them later.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-white/80 bg-white/5 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === 'edit' ? (
          <DeleteDialog
            itemType="reading list"
            onDelete={async () => {
              const result = await store.deleteList(listId!);
              if (!result.success) throw new Error(result.message);
              router.push('/reading-lists');
            }}
          />
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'create' ? 'Create List' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
