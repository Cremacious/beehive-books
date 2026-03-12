'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Popup from '@/components/ui/popup';
import RoleBadge from '@/components/admin/role-badge';
import Pagination from '@/components/shared/pagination';
import {
  updateUserRoleAction,
  toggleUserPremiumAction,
} from '@/lib/actions/admin.actions';

type Role = 'member' | 'moderator' | 'admin';

type User = {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  role: Role;
  premium: boolean;
  createdAt: Date;
};

interface Props {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

type PendingRoleChange = { clerkId: string; username: string | null; newRole: Role; currentRole: Role };
type PendingPremiumToggle = { clerkId: string; username: string | null; currentPremium: boolean };

function UserAvatar({ u }: { u: User }) {
  return u.imageUrl ? (
    <Image
      src={u.imageUrl}
      alt={u.username ?? ''}
      width={36}
      height={36}
      className="w-9 h-9 rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
      <span className="text-[#FFC300] text-xs font-bold">
        {(u.username ?? u.firstName ?? '?')[0]?.toUpperCase()}
      </span>
    </div>
  );
}

export default function UsersTable({ users, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');
  const [pendingRole, setPendingRole] = useState<PendingRoleChange | null>(null);
  const [pendingPremium, setPendingPremium] = useState<PendingPremiumToggle | null>(null);
  const [pending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);

  const updateUrl = (newPage: number, newSearch?: string) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    const s = newSearch !== undefined ? newSearch : (searchParams.get('search') ?? '');
    if (s) params.set('search', s);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(1, searchValue);
  };

  const confirmRoleChange = () => {
    if (!pendingRole) return;
    startTransition(async () => {
      await updateUserRoleAction(pendingRole.clerkId, pendingRole.newRole);
      setPendingRole(null);
      router.refresh();
    });
  };

  const confirmPremiumToggle = () => {
    if (!pendingPremium) return;
    startTransition(async () => {
      await toggleUserPremiumAction(pendingPremium.clerkId);
      setPendingPremium(null);
      router.refresh();
    });
  };

  const displayName = (u: User) =>
    u.username ? u.username : [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

  const RoleSelect = ({ u }: { u: User }) => (
    <select
      value={u.role}
      disabled={pending}
      onChange={(e) => {
        const newRole = e.target.value as Role;
        if (newRole !== u.role) {
          setPendingRole({ clerkId: u.clerkId, username: u.username, newRole, currentRole: u.role });
        }
      }}
      className="bg-transparent border-0 text-sm cursor-pointer focus:outline-none text-white"
    >
      <option value="member" className="bg-[#252525]">Member</option>
      <option value="moderator" className="bg-[#252525]">Moderator</option>
      <option value="admin" className="bg-[#252525]">Admin</option>
    </select>
  );

  const PremiumButton = ({ u }: { u: User }) => (
    <button
      onClick={() => setPendingPremium({ clerkId: u.clerkId, username: u.username, currentPremium: u.premium })}
      disabled={pending}
      className="focus:outline-none"
    >
      <Badge
        variant={u.premium ? 'default' : 'outline'}
        className={u.premium ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer hover:opacity-80 text-white'}
      >
        {u.premium ? 'Premium' : 'Free'}
      </Badge>
    </button>
  );

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by username, email or name…"
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

      <p className="text-sm text-white mb-3">{total.toLocaleString()} users</p>

      <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
        {users.map((u) => (
          <div key={u.clerkId} className="p-4 hover:bg-white/2 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar u={u} />
                <div className="min-w-0">
                  {u.username ? (
                    <Link href={`/u/${u.username}`} className="font-medium text-white hover:text-[#FFC300] transition-colors block truncate">
                      {u.username}
                    </Link>
                  ) : (
                    <span className="text-white italic text-sm">no username</span>
                  )}
                  <p className="text-xs text-white truncate">{u.email}</p>
                </div>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <RoleSelect u={u} />
              <PremiumButton u={u} />
              <span className="text-xs text-white ml-auto">{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-white text-sm">No users found.</p>
        )}
      </div>

      <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white font-medium">User</th>
              <th className="text-left px-4 py-3 text-white font-medium">Email</th>
              <th className="text-left px-4 py-3 text-white font-medium">Role</th>
              <th className="text-left px-4 py-3 text-white font-medium">Premium</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {users.map((u) => (
              <tr key={u.clerkId} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar u={u} />
                    <div>
                      {u.username ? (
                        <Link href={`/u/${u.username}`} className="text-white font-medium hover:text-[#FFC300] transition-colors">
                          {u.username}
                        </Link>
                      ) : (
                        <span className="text-white italic">no username</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleSelect u={u} />
                  <div className="mt-0.5"><RoleBadge role={u.role} /></div>
                </td>
                <td className="px-4 py-3"><PremiumButton u={u} /></td>
                <td className="px-4 py-3 text-white text-xs hidden lg:table-cell">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white text-sm">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateUrl(p)} />
      </div>

      <Popup open={!!pendingRole} onClose={() => setPendingRole(null)} title="Change Role" maxWidth="sm">
        <p className="text-sm text-white mb-1">
          Change role for{' '}
          <span className="text-white font-medium">
            {pendingRole ? displayName(users.find((u) => u.clerkId === pendingRole.clerkId) ?? { username: pendingRole.username, firstName: null, lastName: null, email: '' } as User) : ''}
          </span>
        </p>
        <p className="text-sm text-white mb-6">
          <span className="capitalize text-white">{pendingRole?.currentRole}</span>
          {' → '}
          <span className="capitalize text-white font-medium">{pendingRole?.newRole}</span>
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingRole(null)} disabled={pending}>Cancel</Button>
          <Button onClick={confirmRoleChange} disabled={pending}>{pending ? 'Saving…' : 'Confirm'}</Button>
        </div>
      </Popup>

      <Popup
        open={!!pendingPremium}
        onClose={() => setPendingPremium(null)}
        title={pendingPremium?.currentPremium ? 'Revoke Premium' : 'Grant Premium'}
        maxWidth="sm"
      >
        <p className="text-sm text-white mb-6">
          {pendingPremium?.currentPremium ? 'Remove premium status from ' : 'Grant premium status to '}
          <span className="text-white font-medium">
            {pendingPremium ? displayName(users.find((u) => u.clerkId === pendingPremium.clerkId) ?? { username: pendingPremium.username, firstName: null, lastName: null, email: '' } as User) : ''}
          </span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingPremium(null)} disabled={pending}>Cancel</Button>
          <Button onClick={confirmPremiumToggle} disabled={pending}>{pending ? 'Saving…' : 'Confirm'}</Button>
        </div>
      </Popup>
    </div>
  );
}
