'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Trash2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/pagination';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  deleteDiscussionAdminAction,
  deleteDiscussionReplyAdminAction,
} from '@/lib/actions/admin.actions';

type Discussion = {
  id: string;
  title: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: Date;
  clubId: string;
  author: { username: string | null; firstName: string | null; lastName: string | null } | null;
  club: { name: string } | null;
};

type Reply = {
  id: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  discussionId: string;
  author: { username: string | null; firstName: string | null; lastName: string | null } | null;
  discussion: { title: string } | null;
};

interface Props {
  discussions: Discussion[];
  discussionsTotal: number;
  discussionsPage: number;
  replies: Reply[];
  repliesTotal: number;
  repliesPage: number;
  pageSize: number;
}

export default function DiscussionsTable({
  discussions, discussionsTotal, discussionsPage,
  replies, repliesTotal, repliesPage,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('tab') as 'discussions' | 'replies') ?? 'discussions';
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'discussion' | 'reply' } | null>(null);
  const [pending, startTransition] = useTransition();

  const discussionsPages = Math.ceil(discussionsTotal / pageSize);
  const repliesPages = Math.ceil(repliesTotal / pageSize);

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
      if (deleteTarget.type === 'discussion') {
        await deleteDiscussionAdminAction(deleteTarget.id);
      } else {
        await deleteDiscussionReplyAdminAction(deleteTarget.id);
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {(['discussions', 'replies'] as const).map((tab) => (
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

      {activeTab === 'discussions' && (
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

          <p className="text-sm text-white mb-3">{discussionsTotal.toLocaleString()} discussions</p>

          <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
            {discussions.map((d) => (
              <div key={d.id} className="p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {d.isPinned && <Pin className="w-3 h-3 text-[#FFC300] shrink-0" />}
                    <p className="font-medium text-white truncate">{d.title}</p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget({ id: d.id, type: 'discussion' })}
                    className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-white">
                  {d.club?.name && <span className="truncate max-w-[120px]">{d.club.name}</span>}
                  {d.author?.username && (
                    <Link href={`/u/${d.author.username}`} className="hover:text-[#FFC300] transition-colors">
                      @{d.author.username}
                    </Link>
                  )}
                  <span>{d.likeCount} likes</span>
                  <span>{d.replyCount} replies</span>
                  <span className="ml-auto text-white">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {discussions.length === 0 && (
              <p className="px-4 py-8 text-center text-white text-sm">No discussions found.</p>
            )}
          </div>

          <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#252525]">
                  <th className="text-left px-4 py-3 text-white font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Club</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Author</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Likes</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Replies</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {discussions.map((d) => (
                  <tr key={d.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {d.isPinned && <Pin className="w-3 h-3 text-[#FFC300] shrink-0" />}
                        <p className="font-medium text-white">{d.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{d.club?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {d.author?.username ? (
                        <Link href={`/u/${d.author.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                          @{d.author.username}
                        </Link>
                      ) : (
                        <span className="text-white italic">unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{d.likeCount}</td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{d.replyCount}</td>
                    <td className="px-4 py-3 text-white text-xs hidden xl:table-cell">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: d.id, type: 'discussion' })}
                        className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {discussions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-white text-sm">No discussions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination page={discussionsPage} totalPages={discussionsPages} onPageChange={(p) => updateUrl({ page: String(p) })} />
          </div>
        </>
      )}

      {activeTab === 'replies' && (
        <>
          <p className="text-sm text-white mb-3">{repliesTotal.toLocaleString()} replies</p>

          <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
            {replies.map((r) => (
              <div key={r.id} className="p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-sm line-clamp-2">{r.content.slice(0, 120)}…</p>
                  <button
                    onClick={() => setDeleteTarget({ id: r.id, type: 'reply' })}
                    className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-white">
                  {r.author?.username && (
                    <Link href={`/u/${r.author.username}`} className="hover:text-[#FFC300] transition-colors">
                      @{r.author.username}
                    </Link>
                  )}
                  {r.discussion?.title && <span className="truncate max-w-[140px]">{r.discussion.title}</span>}
                  <span>{r.likeCount} likes</span>
                  <span className="ml-auto text-white">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {replies.length === 0 && (
              <p className="px-4 py-8 text-center text-white text-sm">No replies found.</p>
            )}
          </div>

          <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#252525]">
                  <th className="text-left px-4 py-3 text-white font-medium">Content</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Author</th>
                  <th className="text-left px-4 py-3 text-white font-medium">Discussion</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Likes</th>
                  <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {replies.map((r) => (
                  <tr key={r.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white max-w-[200px] truncate">{r.content.slice(0, 80)}…</td>
                    <td className="px-4 py-3">
                      {r.author?.username ? (
                        <Link href={`/u/${r.author.username}`} className="text-white hover:text-[#FFC300] transition-colors">
                          @{r.author.username}
                        </Link>
                      ) : (
                        <span className="text-white italic">unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white max-w-[160px] truncate">{r.discussion?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-white hidden lg:table-cell">{r.likeCount}</td>
                    <td className="px-4 py-3 text-white text-xs hidden xl:table-cell">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: r.id, type: 'reply' })}
                        className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {replies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white text-sm">No replies found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination page={repliesPage} totalPages={repliesPages} onPageChange={(p) => updateUrl({ page: String(p) })} />
          </div>
        </>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={pending}
        title={deleteTarget?.type === 'discussion' ? 'Delete Discussion' : 'Delete Reply'}
        description={
          deleteTarget?.type === 'discussion'
            ? 'Delete this discussion and all its replies?'
            : 'Delete this reply permanently?'
        }
      />
    </div>
  );
}
