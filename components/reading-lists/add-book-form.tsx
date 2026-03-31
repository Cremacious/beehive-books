'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Search, PenLine, Check } from 'lucide-react';
import { searchBooksForListAction } from '@/lib/actions/reading-list.actions';
import { useReadingListStore } from '@/lib/stores/reading-list-store';

type BookResult = { id: string; title: string; author: string; authorUsername: string | null; coverUrl: string | null };

export function AddBookForm({ listId }: { listId: string }) {
  const router = useRouter();
  const store = useReadingListStore();

  // Beehive search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Manual entry
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); return; }
      setSearching(true);
      const res = await searchBooksForListAction(query.trim());
      setResults(res);
      setSearching(false);
    }, 300);
  }, [query]);

  async function addBook(data: { title: string; author: string; bookId?: string }) {
    setSubmitting(true);
    setError('');
    const result = await store.addBook(listId, data);
    setSubmitting(false);
    if (result.success) {
      setQuery(''); setResults([]);
      setManualTitle(''); setManualAuthor('');
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Add a Book</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:divide-x md:divide-[#2a2a2a]">

        {/* LEFT — Search Beehive Books */}
        <div className="md:pr-4">
          <p className="text-xs text-white/80 mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search Beehive Books
          </p>
          <div className="relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20"
            />
            {searching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-white/80" />}
          </div>

          {results.length > 0 && (
            <div className="mt-2 border border-[#2a2a2a] rounded-xl overflow-hidden">
              {results.map(book => (
                <button
                  key={book.id}
                  type="button"
                  disabled={submitting}
                  onClick={() => addBook({ title: book.title, author: book.author, bookId: book.id })}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#252525] transition-colors text-left border-b border-[#2a2a2a] last:border-b-0"
                >
                  <div className="w-8 h-12 rounded shrink-0 bg-[#252525] overflow-hidden relative">
                    {book.coverUrl ? (
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white/80">{book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{book.title}</p>
                    <p className="text-xs text-white/80 truncate">by {book.authorUsername}</p>
                  </div>
                  {submitting
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-white/80" />
                    : <Check className="w-3.5 h-3.5 shrink-0 text-yellow-500 opacity-0 group-hover:opacity-100" />
                  }
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <p className="text-xs text-white/80 mt-2 px-1">No books found on Beehive Books.</p>
          )}
        </div>

        {/* RIGHT — Manual entry */}
        <div className="md:pl-4">
          <p className="text-xs text-white/80 mb-2 flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5" /> Add manually
          </p>
          <div className="flex flex-col gap-2">
            <input
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="Book title"
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20"
            />
            <input
              value={manualAuthor}
              onChange={e => setManualAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20"
            />
            <button
              type="button"
              disabled={!manualTitle.trim() || !manualAuthor.trim() || submitting}
              onClick={() => addBook({ title: manualTitle.trim(), author: manualAuthor.trim() })}
              className="w-full px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD040] transition-colors flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </button>
          </div>
        </div>

      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </div>
  );
}
