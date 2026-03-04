'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Trash2, Globe, Lock, Users, BookOpen, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHiveStore } from '@/lib/stores/hive-store';
import { hiveSchema } from '@/lib/validations/hive.schema';
import type { HiveSchemaData } from '@/lib/validations/hive.schema';
import type { HiveFormProps } from '@/lib/types/hive.types';

const PRIVACY_OPTIONS = [
  {
    value: 'PUBLIC' as const,
    label: 'Public',
    desc: 'Anyone can find and join this hive',
    Icon: Globe,
  },
  {
    value: 'FRIENDS' as const,
    label: 'Friends',
    desc: 'Only your friends can join',
    Icon: Users,
  },
  {
    value: 'PRIVATE' as const,
    label: 'Private',
    desc: 'Invite only — hidden from search',
    Icon: Lock,
  },
];

const BOOK_OPTIONS = [
  {
    value: 'new' as const,
    label: 'Start fresh',
    desc: 'Create a new book for this hive',
    Icon: Sparkles,
  },
  {
    value: 'existing' as const,
    label: 'Link existing book',
    desc: 'Connect to a book already in your library',
    Icon: BookOpen,
  },
  {
    value: 'later' as const,
    label: 'Decide later',
    desc: 'Set up the book after creating the hive',
    Icon: Plus,
  },
];

export default function HiveForm({ mode, hiveId, defaultValues, cancelHref, userBooks = [] }: HiveFormProps) {
  const router = useRouter();
  const store = useHiveStore();

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [bookOption, setBookOption] = useState<'new' | 'existing' | 'later'>('new');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const form = useForm<HiveSchemaData>({
    resolver: zodResolver(hiveSchema) as import('react-hook-form').Resolver<HiveSchemaData>,
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      privacy: defaultValues?.privacy ?? 'PRIVATE',
      genre: defaultValues?.genre ?? '',
      tags: defaultValues?.tags ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library
  const privacy = watch('privacy');

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t) || tags.length >= 10) return;
    const next = [...tags, t];
    setTags(next);
    setValue('tags', next);
    setTagInput('');
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    setValue('tags', next);
  }

  const onSubmit = async (data: HiveSchemaData) => {
    setError('');
    const payload = {
      ...data,
      tags,
      ...(mode === 'create' && bookOption === 'new' && newBookTitle && newBookAuthor
        ? { newBookTitle, newBookAuthor }
        : {}),
      ...(mode === 'create' && bookOption === 'existing' && selectedBookId
        ? { bookId: selectedBookId }
        : {}),
    };

    if (mode === 'create') {
      const result = await store.createHive(payload);
      if (result.success && result.hiveId) {
        router.push(`/hive/${result.hiveId}`);
      } else {
        setError(result.message);
      }
    } else {
      const result = await store.updateHive(hiveId!, payload);
      if (result.success) {
        router.push(`/hive/${hiveId}`);
      } else {
        setError(result.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this hive? This cannot be undone.')) return;
    setDeleting(true);
    const result = await store.deleteHive(hiveId!);
    if (result.success) {
      router.push('/hive');
    } else {
      setError(result.message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Hive Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register('name')}
          placeholder="e.g. The Midnight Chronicles Hive…"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Description <span className="text-white/40 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="What are you building? What's the story about?"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Genre <span className="text-white/40 font-normal">(optional)</span>
        </label>
        <input
          {...register('genre')}
          placeholder="e.g. Fantasy, Sci-Fi, Romance…"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Privacy</label>
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc, Icon }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all ${
                  privacy === value
                    ? 'border-[#FFC300]/50 bg-[#FFC300]/8'
                    : 'border-[#2a2a2a] bg-[#252525]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    privacy === value ? 'text-[#FFC300]' : 'text-white/60'
                  }`}
                />
                <span
                  className={`text-xs font-semibold block ${
                    privacy === value ? 'text-[#FFC300]' : 'text-white'
                  }`}
                >
                  {label}
                </span>
                <span className="text-xs text-white/50 leading-tight block">{desc}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-400 mt-1">{errors.privacy.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Tags <span className="text-white/40 font-normal">(up to 10)</span>
        </label>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. fantasy, dark-fiction, co-write…"
              className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
              className="px-3 py-2 rounded-lg bg-[#FFC300]/15 text-[#FFC300] hover:bg-[#FFC300]/25 disabled:opacity-30 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-white bg-[#1e1e1e] border border-[#3a3a3a] rounded-full px-2.5 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 text-center py-1">
              No tags yet — tags help others find your hive.
            </p>
          )}
        </div>
      </div>

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Book</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {BOOK_OPTIONS.map(({ value, label, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setBookOption(value)}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                  bookOption === value
                    ? 'border-[#FFC300]/50 bg-[#FFC300]/8'
                    : 'border-[#2a2a2a] bg-[#252525]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${bookOption === value ? 'text-[#FFC300]' : 'text-white/60'}`}
                />
                <span
                  className={`text-xs font-semibold ${bookOption === value ? 'text-[#FFC300]' : 'text-white'}`}
                >
                  {label}
                </span>
                <span className="text-xs text-white/50 leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          {bookOption === 'new' && (
            <div className="space-y-2 rounded-xl border border-[#2a2a2a] bg-[#252525] p-3">
              <input
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Book title"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
              <input
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                placeholder="Author name (you or a pen name)"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
            </div>
          )}

          {bookOption === 'existing' && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] overflow-hidden">
              {userBooks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                  <BookOpen className="w-8 h-8 text-white/20" />
                  <p className="text-sm text-white/50">No books in your library yet.</p>
                  <p className="text-xs text-white/30">
                    Create a book first, or choose &ldquo;Start fresh&rdquo; to create one now.
                  </p>
                </div>
              ) : (
                <ul className="max-h-56 overflow-y-auto divide-y divide-[#2a2a2a]">
                  {userBooks.map((book) => {
                    const selected = selectedBookId === book.id;
                    return (
                      <li key={book.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedBookId(selected ? null : book.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            selected ? 'bg-[#FFC300]/8' : 'hover:bg-white/4'
                          }`}
                        >
                          {book.coverUrl ? (
                            <Image
                              src={book.coverUrl}
                              alt={book.title}
                              width={32}
                              height={44}
                              className="w-8 h-11 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded bg-[#1e1e1e] border border-[#3a3a3a] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${selected ? 'text-[#FFC300]' : 'text-white'}`}>
                              {book.title}
                            </p>
                            <p className="text-xs text-white/50 truncate">{book.author}</p>
                          </div>
                          {selected && (
                            <Check className="w-4 h-4 text-[#FFC300] shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === 'edit' ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Hive
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" asChild>
            <a href={cancelHref}>Cancel</a>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'create' ? 'Create Hive' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
