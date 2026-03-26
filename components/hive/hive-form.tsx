'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Loader2,
  BookOpen,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { FriendInvitePicker } from '@/components/shared/friend-invite-picker';
import { useHiveStore } from '@/lib/stores/hive-store';
import { hiveSchema } from '@/lib/validations/hive.schema';
import type { HiveSchemaData } from '@/lib/validations/hive.schema';
import type { HiveFormProps } from '@/lib/types/hive.types';

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE' as const, label: 'Private', desc: 'Invite only — hidden from search' },
  { value: 'FRIENDS' as const, label: 'Friends', desc: 'Visible to your friends only' },
  { value: 'PUBLIC' as const, label: 'Public', desc: 'Anyone can find and request to join' },
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

export default function HiveForm({
  mode,
  hiveId,
  defaultValues,
  cancelHref,
  userBooks = [],
  friends = [],
  pendingFriends = [],
}: HiveFormProps) {
  const router = useRouter();
  const store = useHiveStore();

  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [bookOption, setBookOption] = useState<'new' | 'existing' | 'later'>(
    'new',
  );
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const form = useForm<HiveSchemaData>({
    resolver: zodResolver(
      hiveSchema,
    ) as import('react-hook-form').Resolver<HiveSchemaData>,
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      privacy: defaultValues?.privacy ?? 'PRIVATE',
      explorable: defaultValues?.explorable ?? false,
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

  const privacy = watch('privacy');
  const explorableValue = watch('explorable');


  const onSubmit = async (data: HiveSchemaData) => {
    setError('');
    const payload = {
      ...data,
      tags,
      ...(mode === 'create' &&
      bookOption === 'new' &&
      newBookTitle &&
      newBookAuthor
        ? { newBookTitle, newBookAuthor }
        : {}),
      ...(mode === 'create' && bookOption === 'existing' && selectedBookId
        ? { bookId: selectedBookId }
        : {}),
    };

    if (mode === 'create') {
      const result = await store.createHive(payload, invitedIds);
      if (result.success && result.hiveId) {
        router.push(`/hive/${result.hiveId}`);
      } else {
        setError(result.message);
      }
    } else {
      const result = await store.updateHive(hiveId!, payload);
      if (result.success) {
        for (const friendId of invitedIds) {
          await store.inviteMember(hiveId!, friendId);
        }
        router.push(`/hive/${hiveId}`);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">
          Hive Name <span className="text-white/80 text-xs font-normal">(required)</span>
        </label>
        <p className="text-xs text-white/80">The name of your writing group or collaboration.</p>
        <input
          {...register('name')}
          placeholder="e.g. The Midnight Chronicles Hive…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <p className="text-xs text-white/80 text-right">{watch('name')?.length ?? 0} / 80</p>
        {errors.name && (
          <p className="text-xs text-white/80">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">
          Description{' '}
          <span className="text-white/80 text-xs font-normal">(optional)</span>
        </label>
        <p className="text-xs text-white/80">Tell potential members what this hive is about.</p>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="What are you building? What's the story about?"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        <p className="text-xs text-white/80 text-right">{watch('description')?.length ?? 0} / 300</p>
        {errors.description && (
          <p className="text-xs text-white/80">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">
          Genre <span className="text-white/80 text-xs font-normal">(optional)</span>
        </label>
        <p className="text-xs text-white/80">The primary genre your hive focuses on.</p>
        <input
          {...register('genre')}
          placeholder="e.g. Fantasy, Sci-Fi, Romance…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">
          Privacy
        </label>
        <p className="text-xs text-white/80">Open: anyone can request to join. Invite-only: you control membership.</p>
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
                <span className="text-xs text-white/80 mt-0.5 leading-tight">
                  {desc}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-xs text-white/80">{errors.privacy.message}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl bg-[#252525] border border-[#2a2a2a] p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Compass className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-medium text-white">Explorable</span>
          </div>
          <p className="text-sm text-white/80">
            List this hive on the Explore page so all users can discover it.
            Enabling this will make the hive public.
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

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Tags <span className="text-white/80 text-xs font-normal">(up to 10)</span>
        </label>
        <TagInput
          value={tags}
          onChange={(next) => { setTags(next); setValue('tags', next); }}
          placeholder="e.g. fantasy, dark-fiction, co-write…"
          emptyMessage="No tags yet — tags help others find your hive."
        />
      </div>

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
            Book
          </label>
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
                  className={`w-4 h-4 ${bookOption === value ? 'text-[#FFC300]' : 'text-white/80'}`}
                />
                <span
                  className={`text-xs font-semibold ${bookOption === value ? 'text-[#FFC300]' : 'text-white'}`}
                >
                  {label}
                </span>
                <span className="text-xs text-white/80 leading-tight">
                  {desc}
                </span>
              </button>
            ))}
          </div>

          {bookOption === 'new' && (
            <div className="space-y-2 rounded-xl border border-[#2a2a2a] bg-[#252525] p-3">
              <input
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Book title"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
              <input
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                placeholder="Author name (you or a pen name)"
                className="w-full rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
            </div>
          )}

          {bookOption === 'existing' && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] overflow-hidden">
              {userBooks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                  <BookOpen className="w-8 h-8 text-white/80" />
                  <p className="text-sm text-white/80">
                    No books in your library yet.
                  </p>
                  <p className="text-xs text-white/80">
                    Create a book first, or choose &ldquo;Start fresh&rdquo; to
                    create one now.
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
                          onClick={() =>
                            setSelectedBookId(selected ? null : book.id)
                          }
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
                            <div className="w-8 h-11 rounded bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-white/80" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${selected ? 'text-[#FFC300]' : 'text-white'}`}
                            >
                              {book.title}
                            </p>
                            <p className="text-xs text-white/80 truncate">
                              {book.author}
                            </p>
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

      {(friends.length > 0 || pendingFriends.length > 0) && (
        <FriendInvitePicker
          friends={friends}
          pendingFriends={pendingFriends}
          selectedIds={invitedIds}
          onChange={setInvitedIds}
        />
      )}

      {error && (
        <p className="text-sm text-white/80 bg-white/5 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === 'edit' ? (
          <DeleteDialog
            itemType="hive"
            onDelete={async () => {
              const result = await store.deleteHive(hiveId!);
              if (!result.success) throw new Error(result.message);
              router.push('/hive');
            }}
          />
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
