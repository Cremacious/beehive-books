'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/pagination';

type Chapter = {
  id: string;
  title: string;
  wordCount: number;
  order: number;
  createdAt: Date;
  bookId: string;
  book: {
    title: string;
    userId: string;
    user: { username: string | null } | null;
  } | null;
};

interface Props {
  chapters: Chapter[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ChaptersTable({ chapters, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');

  const totalPages = Math.ceil(total / pageSize);

  const updateUrl = (newPage: number, newSearch?: string) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    const s = newSearch !== undefined ? newSearch : searchParams.get('search') ?? '';
    if (s) params.set('search', s);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(1, searchValue);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by chapter title…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">Search</Button>
        {searchParams.get('search') && (
          <Button type="button" variant="ghost" size="sm" onClick={() => { setSearchValue(''); updateUrl(1, ''); }}>
            Clear
          </Button>
        )}
      </form>

      <p className="text-sm text-white mb-3">{total.toLocaleString()} chapters</p>

      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white font-medium">Chapter</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden md:table-cell">Book</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Words</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Order</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {chapters.map((c) => (
              <tr key={c.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.title}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {c.book ? (
                    <span className="text-white">{c.book.title}</span>
                  ) : (
                    <span className="text-white/30 italic">unknown</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {c.book?.user?.username ? (
                    <Link href={`/u/${c.book.user.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                      {c.book.user.username}
                    </Link>
                  ) : (
                    <span className="text-white/30 italic">unknown</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white hidden lg:table-cell">
                  {c.wordCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white hidden lg:table-cell">{c.order + 1}</td>
                <td className="px-4 py-3 text-white text-xs hidden xl:table-cell">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {chapters.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white text-sm">
                  No chapters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateUrl(p)} />
      </div>
    </div>
  );
}
