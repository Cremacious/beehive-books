'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { useReadingListStore } from '@/lib/stores/reading-list-store';

export function AddBookForm({ listId }: { listId: string }) {
  const router  = useRouter();
  const store   = useReadingListStore();
  const [title,       setTitle]       = useState('');
  const [author,      setAuthor]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim() || submitting) return;
    setError('');
    setSubmitting(true);
    const result = await store.addBook(listId, { title: title.trim(), author: author.trim() });
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
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Add a Book</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/55 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={!title.trim() || !author.trim() || submitting}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold disabled:opacity-40 hover:bg-[#FFD54F] transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Book
        </button>
      </form>
    </div>
  );
}
