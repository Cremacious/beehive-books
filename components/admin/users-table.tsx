'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoleBadge from '@/components/admin/role-badge';
import Pagination from '@/components/shared/pagination';
import { updateUserRoleAction, toggleUserPremiumAction } from '@/lib/actions/admin.actions';

type User = {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  role: 'member' | 'moderator' | 'admin';
  premium: boolean;
  createdAt: Date;
};

interface Props {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export default function UsersTable({ users, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
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

  const handleRoleChange = (clerkId: string, role: 'member' | 'moderator' | 'admin') => {
    startTransition(async () => {
      await updateUserRoleAction(clerkId, role);
      router.refresh();
    });
  };

  const handleTogglePremium = (clerkId: string) => {
    startTransition(async () => {
      await toggleUserPremiumAction(clerkId);
      router.refresh();
    });
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by username, email or name…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
        {searchParams.get('search') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setSearchValue(''); updateUrl(1, ''); }}
          >
            Clear
          </Button>
        )}
      </form>

      <p className="text-xs text-white/40 mb-3">{total.toLocaleString()} users</p>

      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white/50 font-medium">User</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Premium</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {users.map((u) => (
              <tr key={u.clerkId} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {u.imageUrl ? (
                      <Image
                        src={u.imageUrl}
                        alt={u.username ?? ''}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
                        <span className="text-[#FFC300] text-xs font-bold">
                          {(u.username ?? u.firstName ?? '?')[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      {u.username ? (
                        <Link
                          href={`/u/${u.username}`}
                          className="text-white font-medium hover:text-[#FFC300] transition-colors"
                        >
                          @{u.username}
                        </Link>
                      ) : (
                        <span className="text-white/40 italic">no username</span>
                      )}
                      {(u.firstName || u.lastName) && (
                        <p className="text-xs text-white/40">
                          {[u.firstName, u.lastName].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={pending}
                    onChange={(e) =>
                      handleRoleChange(u.clerkId, e.target.value as 'member' | 'moderator' | 'admin')
                    }
                    className="bg-transparent border-0 text-sm cursor-pointer focus:outline-none"
                  >
                    <option value="member" className="bg-[#252525]">Member</option>
                    <option value="moderator" className="bg-[#252525]">Moderator</option>
                    <option value="admin" className="bg-[#252525]">Admin</option>
                  </select>
                  <div className="mt-0.5">
                    <RoleBadge role={u.role} />
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <button
                    onClick={() => handleTogglePremium(u.clerkId)}
                    disabled={pending}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant={u.premium ? 'default' : 'outline'}
                      className={u.premium ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer hover:opacity-80 text-white/30'}
                    >
                      {u.premium ? 'Premium' : 'Free'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs hidden lg:table-cell">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                  No users found.
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
