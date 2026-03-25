'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useReadingListStore } from '@/lib/stores/reading-list-store';

export function AddBookForm({ listId }: { listId: string }) {
  const router = useRouter();
  const store = useReadingListStore();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim() || submitting) return;
    setError('');
    setSubmitting(true);
    const result = await store.addBook(listId, {
      title: title.trim(),
      author: author.trim(),
    });
    setSubmitting(false);
    if (result.success) {
      setTitle('');
      setAuthor('');
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-xs font-medium text-white/80 mb-2">Add a Book</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title"
          className="flex-1 min-w-0 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="flex-1 min-w-0 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <button
          type="submit"
          disabled={!title.trim() || !author.trim() || submitting}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD040] transition-colors flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
