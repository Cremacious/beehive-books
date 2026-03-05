'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  Plus,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HiveForm from '@/components/hive/hive-form';
import HiveInvitePicker from '@/components/hive/hive-invite-picker';
import {
  linkBookToHiveAction,
  unlinkBookFromHiveAction,
  createAndLinkBookAction,
} from '@/lib/actions/hive.actions';
import type {
  HiveWithMembership,
  HiveBookOption,
  InvitableFriend,
} from '@/lib/types/hive.types';

type BookMode = 'new' | 'existing' | 'later';

const BOOK_MODE_OPTIONS: {
  value: BookMode;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  {
    value: 'new',
    label: 'Create new book',
    desc: 'Start a fresh book for this hive',
    Icon: Sparkles,
  },
  {
    value: 'existing',
    label: 'Link from library',
    desc: 'Choose a book you already own',
    Icon: BookOpen,
  },
  {
    value: 'later',
    label: 'Decide later',
    desc: 'Link a book another time',
    Icon: Plus,
  },
];

interface HiveSettingsProps {
  hive: HiveWithMembership;
  userBooks: HiveBookOption[];
  linkedBook: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
  } | null;
  invitableFriends?: InvitableFriend[];
}

export default function HiveSettings({
  hive,
  userBooks,
  linkedBook,
  invitableFriends = [],
}: HiveSettingsProps) {
  const router = useRouter();

  const [showInvitePicker, setShowInvitePicker] = useState(false);
  const [bookMode, setBookMode] = useState<BookMode>('existing');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [bookError, setBookError] = useState('');

  const handleSaveBook = async () => {
    setBookError('');
    setSaving(true);
    let result;

    if (bookMode === 'new') {
      if (!newTitle.trim() || !newAuthor.trim()) {
        setBookError('Book title and author are required.');
        setSaving(false);
        return;
      }
      result = await createAndLinkBookAction(hive.id, newTitle, newAuthor);
    } else if (bookMode === 'existing') {
      if (!selectedBookId) {
        setBookError('Please select a book from your library.');
        setSaving(false);
        return;
      }
      result = await linkBookToHiveAction(hive.id, selectedBookId);
    } else {
      setSaving(false);
      return;
    }

    if (result.success) {
      router.refresh();
    } else {
      setBookError(result.message);
    }
    setSaving(false);
  };

  const handleUnlink = async () => {
    if (
      !confirm(
        'Unlink the book from this hive? The book will remain in your library.',
      )
    )
      return;
    setUnlinking(true);
    const result = await unlinkBookFromHiveAction(hive.id);
    if (result.success) {
      router.refresh();
    } else {
      setBookError(result.message);
    }
    setUnlinking(false);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mainFont">
    
          Hive Book
        </h2>

        {linkedBook ? (
          <div className="flex items-center gap-4">
            {linkedBook.coverUrl ? (
              <Image
                src={linkedBook.coverUrl}
                alt={linkedBook.title}
                width={48}
                height={64}
                className="w-12 h-16 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-[#1e1e1e] border border-[#3a3a3a] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white/80" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {linkedBook.title}
              </p>
              <p className="text-xs text-white/80 truncate">
                {linkedBook.author}
              </p>
              <Link
                href={`/library/${linkedBook.id}`}
                className="inline-flex items-center gap-1 text-xs text-[#FFC300] hover:underline mt-1"
              >
                Open in Library <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              {unlinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Unlink
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/80">
              No book linked yet. Link or create a book so your hive has a
              shared workspace.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {BOOK_MODE_OPTIONS.map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBookMode(value)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                    bookMode === value
                      ? 'border-[#FFC300]/50 bg-[#FFC300]/8'
                      : 'border-[#2a2a2a] bg-[#1e1e1e]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${bookMode === value ? 'text-[#FFC300]' : 'text-white/80'}`}
                  />
                  <span
                    className={`text-xs font-semibold ${bookMode === value ? 'text-[#FFC300]' : 'text-white'}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-white/80 leading-tight">
                    {desc}
                  </span>
                </button>
              ))}
            </div>

            {bookMode === 'new' && (
              <div className="space-y-2 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] p-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Book title"
                  className="w-full rounded-lg bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 transition-all"
                />
                <input
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full rounded-lg bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 transition-all"
                />
              </div>
            )}

            {bookMode === 'existing' && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] overflow-hidden">
                {userBooks.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                    <BookOpen className="w-8 h-8 text-white/80" />
                    <p className="text-sm text-white/80">
                      No books in your library.
                    </p>
                    <p className="text-xs text-white/80">
                      Switch to &ldquo;Create new book&rdquo; to add one now.
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
                              <div className="w-8 h-11 rounded bg-[#252525] border border-[#3a3a3a] flex items-center justify-center shrink-0">
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

            {bookError && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
                {bookError}
              </p>
            )}

            {bookMode !== 'later' && (
              <div className="flex justify-end">
                <Button onClick={handleSaveBook} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Link Book
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
        <button
          onClick={() => setShowInvitePicker((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-6 py-4 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#FFC300]" />
            Invite Members
          </span>
          {invitableFriends.length > 0 && (
            <span className="text-xs text-white/80">
              {invitableFriends.length} friend{invitableFriends.length !== 1 ? 's' : ''} available
            </span>
          )}
        </button>
        {showInvitePicker && (
          <div className="px-6 pb-6 border-t border-[#2a2a2a]">
            <div className="pt-4">
              <HiveInvitePicker
                hiveId={hive.id}
                friends={invitableFriends}
                onInvited={() => router.refresh()}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 space-y-4">
        <h2 className="text-base font-semibold text-white mainFont">Hive Settings</h2>
        <HiveForm
          mode="edit"
          hiveId={hive.id}
          defaultValues={hive}
          cancelHref={`/hive/${hive.id}`}
        />
      </div>
    </div>
  );
}
