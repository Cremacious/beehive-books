'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useReadingListStore } from '@/lib/stores/reading-list-store';
import { searchBooksForListAction } from '@/lib/actions/reading-list.actions';

type BookResult = {
  id: string;
  title: string;
  author: string;
  authorUsername: string | null;
  coverUrl: string | null;
  wordCount: number;
};

type Selected = { title: string; author: string; bookId: string };

export function AddBookForm({ listId }: { listId: string }) {
  const router = useRouter();
  const store = useReadingListStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);

  // Manual fallback fields (shown when no result chosen)
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [showManual, setShowManual] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchBooksForListAction(q);
        setResults(res);
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function pickResult(book: BookResult) {
    setSelected({ title: book.title, author: book.author, bookId: book.id });
    setQuery('');
    setResults([]);
    setOpen(false);
    setShowManual(false);
  }

  function clearSelected() {
    setSelected(null);
    setManualTitle('');
    setManualAuthor('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bookData = selected
      ? { title: selected.title, author: selected.author, bookId: selected.bookId }
      : showManual
        ? { title: manualTitle.trim(), author: manualAuthor.trim() }
        : null;

    if (!bookData || !bookData.title || !bookData.author || submitting) return;
    setError('');
    setSubmitting(true);
    const result = await store.addBook(listId, bookData);
    setSubmitting(false);
    if (result.success) {
      setSelected(null);
      setQuery('');
      setManualTitle('');
      setManualAuthor('');
      setShowManual(false);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  const canSubmit = !submitting && (
    selected !== null ||
    (showManual && manualTitle.trim().length > 0 && manualAuthor.trim().length > 0)
  );

  return (
    <div className="max-w-xl">
      <p className="text-xs font-medium text-white/80 mb-2">Add a Book</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">

        {/* Selected state */}
        {selected ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-[#FFC300]/40">
            <Check className="w-4 h-4 text-[#FFC300] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">{selected.title}</p>
              <p className="text-xs text-white/50 truncate">{selected.author}</p>
            </div>
            <button
              type="button"
              onClick={clearSelected}
              className="shrink-0 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                placeholder="Search Beehive Books by title or author…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
              />
            </div>

            {open && results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden shadow-xl">
                {results.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => pickResult(book)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#252525] transition-colors text-left"
                  >
                    <div className="w-8 h-12 rounded overflow-hidden shrink-0 bg-[#2a2a2a]">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          width={32}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#333]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{book.title}</p>
                      <p className="text-xs text-white/50 truncate">
                        {book.author}
                        {book.authorUsername && (
                          <span className="text-white/30"> · @{book.authorUsername}</span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {open && results.length === 0 && query.trim() && !searching && (
              <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 shadow-xl">
                <p className="text-xs text-white/50">No books found.</p>
              </div>
            )}
          </div>
        )}

        {/* Manual entry toggle */}
        {!selected && (
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="self-start text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {showManual ? 'Hide manual entry' : 'Add a book not on Beehive Books'}
          </button>
        )}

        {showManual && !selected && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Book title"
              className="flex-1 min-w-0 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
            />
            <input
              type="text"
              value={manualAuthor}
              onChange={(e) => setManualAuthor(e.target.value)}
              placeholder="Author"
              className="flex-1 min-w-0 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="self-start px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD040] transition-colors flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
}
