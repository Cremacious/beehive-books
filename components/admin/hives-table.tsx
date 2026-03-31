'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/shared/pagination';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import { deleteHiveAdminAction } from '@/lib/actions/admin.actions';

type Hive = {
  id: string;
  name: string;
  privacy: string;
  memberCount: number;
  createdAt: Date;
  ownerId: string;
  bookId: string | null;
  owner: { username: string | null } | null;
  book: { title: string } | null;
};

interface Props {
  hives: Hive[];
  total: number;
  page: number;
  pageSize: number;
}

export default function HivesTable({ hives, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
  const [deleteTarget, setDeleteTarget] = useState<Hive | null>(null);
  const [pending, startTransition] = useTransition();

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

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteHiveAdminAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by hive name…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder:text-white focus:outline-none focus:border-[#FFC300]/40"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">Search</Button>
        {searchParams.get('search') && (
          <Button type="button" variant="ghost" size="sm" onClick={() => { setSearchValue(''); updateUrl(1, ''); }}>
            Clear
          </Button>
        )}
      </form>

      <p className="text-sm text-white mb-3">{total.toLocaleString()} hives</p>

      {/* Mobile */}
      <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
        {hives.map((h) => (
          <div key={h.id} className="p-4 hover:bg-white/2 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-white truncate">{h.name}</p>
              <button
                onClick={() => setDeleteTarget(h)}
                className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-white/80">
              {h.owner?.username && (
                <Link href={`/u/${h.owner.username}`} className="text-white/80 hover:text-[#FFC300] transition-colors">
                  @{h.owner.username}
                </Link>
              )}
              <Badge
                variant="outline"
                className={h.privacy === 'PUBLIC' ? 'bg-green-500/15 text-white border-transparent' : 'bg-white/8 text-white/80 border-transparent'}
              >
                {h.privacy}
              </Badge>
              <span>{h.memberCount} members</span>
              {h.book && <span className="text-white/80">{h.book.title}</span>}
              <span className="ml-auto text-white/80">{new Date(h.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {hives.length === 0 && (
          <p className="px-4 py-8 text-center text-white text-sm">No hives found.</p>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white font-medium">Hive</th>
              <th className="text-left px-4 py-3 text-white font-medium">Owner</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Book</th>
              <th className="text-left px-4 py-3 text-white font-medium">Privacy</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Members</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {hives.map((h) => (
              <tr key={h.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{h.name}</td>
                <td className="px-4 py-3">
                  {h.owner?.username ? (
                    <Link href={`/u/${h.owner.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                      @{h.owner.username}
                    </Link>
                  ) : (
                    <span className="text-white/80 italic">unknown</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/80 hidden lg:table-cell">
                  {h.book?.title ?? <span className="italic text-white/80">None</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={h.privacy === 'PUBLIC' ? 'bg-green-500/15 text-white border-transparent' : 'bg-white/8 text-white/80 border-transparent'}
                  >
                    {h.privacy}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-white/80 hidden lg:table-cell">{h.memberCount}</td>
                <td className="px-4 py-3 text-white/80 text-xs hidden xl:table-cell">
                  {new Date(h.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDeleteTarget(h)}
                    className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {hives.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white text-sm">No hives found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateUrl(p)} />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={pending}
        title="Delete Hive"
        description={`Delete "${deleteTarget?.name}"? This will remove the hive and all its data.`}
      />
    </div>
  );
}
