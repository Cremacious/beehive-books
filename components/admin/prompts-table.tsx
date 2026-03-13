'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/shared/pagination';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  deletePromptAdminAction,
  deletePromptEntryAdminAction,
} from '@/lib/actions/admin.actions';

type Prompt = {
  id: string;
  title: string;
  status: string;
  entryCount: number;
  endDate: Date | null;
  createdAt: Date;
  privacy: string;
  creator: { username: string | null } | null;
};

type Entry = {
  id: string;
  content: string;
  wordCount: number;
  likeCount: number;
  createdAt: Date;
  promptId: string;
  user: { username: string | null } | null;
  prompt: { title: string } | null;
};

interface Props {
  prompts: Prompt[];
  promptsTotal: number;
  promptsPage: number;
  entries: Entry[];
  entriesTotal: number;
  entriesPage: number;
  pageSize: number;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-transparent',
  ENDED: 'bg-white/8 text-white border-transparent',
};

export default function PromptsTable({
  prompts, promptsTotal, promptsPage,
  entries, entriesTotal, entriesPage,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('tab') as 'prompts' | 'entries') ?? 'prompts';
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string; type: 'prompt' | 'entry' } | null>(null);
  const [pending, startTransition] = useTransition();

  const promptsPages = Math.ceil(promptsTotal / pageSize);
  const entriesPages = Math.ceil(entriesTotal / pageSize);

  const updateUrl = (overrides: Partial<{ tab: string; page: string; search: string }>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ page: '1', search: searchValue || undefined as unknown as string });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      if (deleteTarget.type === 'prompt') {
        await deletePromptAdminAction(deleteTarget.id);
      } else {
        await deletePromptEntryAdminAction(deleteTarget.id);
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {(['prompts', 'entries'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => updateUrl({ tab, page: '1', search: undefined as unknown as string })}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-[#FFC300]/10 text-[#FFC300]' : 'text-white hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'prompts' && (
        <>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by title…"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder:text-white focus:outline-none focus:border-[#FFC300]/40"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">Search</Button>
            {searchParams.get('search') && (
              <Button type="button" variant="ghost" size="sm" onClick={() => { setSearchValue(''); updateUrl({ search: undefined as unknown as string, page: '1' }); }}>
                Clear
              </Button>
            )}
          </form>

          <p className="text-sm text-white mb-3">{promptsTotal.toLocaleString()} prompts</p>

          <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
            {prompts.map((p) => (
              <div key={p.id} className="p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white truncate">{p.title}</p>
                  <button
                    onClick={() => setDeleteTarget({ id: p.id, label: p.title, type: 'prompt' })}
                    className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-white">
                  {p.creator?.username && (
                    <Link href={`/u/${p.creator.username}`} className="hover:text-[#FFC300] transition-colors">
                      @{p.creator.username}
                    </Link>
                  )}
                  <Badge variant="outline" className={STATUS_STYLE[p.status] ?? ''}>{p.status}</Badge>
                  <span>{p.entryCount} entries</span>
                  {p.endDate && <span>ends {new Date(p.endDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
            {prompts.length === 0 && (
              <p className="px-4 py-8 text-center text-white text-sm">No prompts found.</p>
            )}
          </div>

          <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#252525]">
                  <th className="text-left px-4 py-3 text-white font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Creator</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Entries</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">End Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{p.title}</td>
                    <td className="px-4 py-3">
                      {p.creator?.username ? (
                        <Link href={`/u/${p.creator.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                          @{p.creator.username}
                        </Link>
                      ) : (
                        <span className="text-white italic">unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_STYLE[p.status] ?? ''}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{p.entryCount}</td>
                    <td className="px-4 py-3 text-white text-xs hidden xl:table-cell">
                      {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: p.id, label: p.title, type: 'prompt' })}
                        className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {prompts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white text-sm">No prompts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination page={promptsPage} totalPages={promptsPages} onPageChange={(p) => updateUrl({ page: String(p) })} />
          </div>
        </>
      )}

      {activeTab === 'entries' && (
        <>
          <p className="text-sm text-white mb-3">{entriesTotal.toLocaleString()} entries</p>

          <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
            {entries.map((e) => (
              <div key={e.id} className="p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-sm line-clamp-2">
                    {e.content.replace(/<[^>]+>/g, ' ').slice(0, 100)}…
                  </p>
                  <button
                    onClick={() => setDeleteTarget({ id: e.id, label: 'this entry', type: 'entry' })}
                    className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-white">
                  {e.user?.username && (
                    <Link href={`/u/${e.user.username}`} className="hover:text-[#FFC300] transition-colors">
                      @{e.user.username}
                    </Link>
                  )}
                  {e.prompt?.title && <span className="truncate max-w-[140px]">{e.prompt.title}</span>}
                  <span>{e.wordCount.toLocaleString()} words</span>
                  <span>{e.likeCount} likes</span>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="px-4 py-8 text-center text-white text-sm">No entries found.</p>
            )}
          </div>

          <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#252525]">
                  <th className="text-left px-4 py-3 text-white font-medium">Excerpt</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Author</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Prompt</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Words</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Likes</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white max-w-[200px] truncate">
                      {e.content.replace(/<[^>]+>/g, ' ').slice(0, 80)}…
                    </td>
                    <td className="px-4 py-3">
                      {e.user?.username ? (
                        <Link href={`/u/${e.user.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                          @{e.user.username}
                        </Link>
                      ) : (
                        <span className="text-white italic">unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white max-w-[160px] truncate">{e.prompt?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{e.wordCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{e.likeCount}</td>
                    <td className="px-4 py-3 text-white text-xs hidden xl:table-cell">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: e.id, label: 'this entry', type: 'entry' })}
                        className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-white text-sm">No entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination page={entriesPage} totalPages={entriesPages} onPageChange={(p) => updateUrl({ page: String(p) })} />
          </div>
        </>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={pending}
        title={deleteTarget?.type === 'prompt' ? 'Delete Prompt' : 'Delete Entry'}
        description={
          deleteTarget?.type === 'prompt'
            ? `Delete "${deleteTarget.label}"? All entries will be removed.`
            : 'Delete this entry permanently?'
        }
      />
    </div>
  );
}
