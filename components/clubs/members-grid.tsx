'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Crown,
  Shield,
  Check,
  MoreVertical,
  Loader2,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type {
  ClubMemberWithUser,
  ClubRole,
  PendingJoinRequest,
  InvitableClubFriend,
} from '@/lib/types/club.types';
import ClubInvitePicker from '@/components/clubs/club-invite-picker';

type RoleFilter = 'ALL' | 'OWNER' | 'MODERATOR' | 'MEMBER';

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OWNER', label: 'Owners' },
  { value: 'MODERATOR', label: 'Moderators' },
  { value: 'MEMBER', label: 'Members' },
];

function RoleBadge({ role }: { role: ClubRole }) {
  if (role === 'OWNER') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2 py-0.5">
        <Crown className="w-3 h-3" />
        Owner
      </span>
    );
  }
  if (role === 'MODERATOR') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
        <Shield className="w-3 h-3" />
        Moderator
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
      <Check className="w-3 h-3" />
      Member
    </span>
  );
}

function MemberCard({
  member,
  clubId,
  myRole,
}: {
  member: ClubMemberWithUser;
  clubId: string;
  myRole: ClubRole;
}) {
  const router = useRouter();
  const store = useClubStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = member.user;
  const displayName = user.username ?? 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!showMenu) return;
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showMenu]);

  const canManage =
    (myRole === 'OWNER' && member.role !== 'OWNER') ||
    (myRole === 'MODERATOR' && member.role === 'MEMBER');

  const handlePromote = async () => {
    setShowMenu(false);
    setLoading(true);
    await store.updateMemberRole(clubId, member.userId, 'MODERATOR');
    setLoading(false);
    router.refresh();
  };

  const handleDemote = async () => {
    setShowMenu(false);
    setLoading(true);
    await store.updateMemberRole(clubId, member.userId, 'MEMBER');
    setLoading(false);
    router.refresh();
  };

  const handleRemove = async () => {
    setShowMenu(false);
    if (!confirm(`Remove ${displayName} from this club?`)) return;
    setLoading(true);
    await store.removeMember(clubId, member.userId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div
      onClick={() => router.push(`/u/${member.userId}`)}
      className="relative flex items-center gap-3 rounded-xl bg-[#252525] border border-[#2a2a2a] p-3 hover:border-[#3a3a3a] transition-all cursor-pointer"
    >
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={displayName}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
          <span className="text-base font-semibold text-[#FFC300]">
            {initials}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className=" font-medium text-white truncate">{displayName}</p>

        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <RoleBadge role={member.role} />
          <span className="text-sm text-white/80">
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {canManage && (
        <div className="relative shrink-0" ref={menuRef}>
          {loading ? (
            <div className="p-1.5">
              <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((v) => !v);
              }}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-48 rounded-xl bg-[#1e1e1e] border border-[#333] shadow-xl py-1 overflow-hidden">
              {myRole === 'OWNER' && member.role === 'MEMBER' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePromote();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                  Promote to Moderator
                </button>
              )}
              {myRole === 'OWNER' && member.role === 'MODERATOR' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemote();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  Demote to Member
                </button>
              )}
              <div className="my-1 border-t border-[#2a2a2a]" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                Remove from Club
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MembersGridProps {
  members: ClubMemberWithUser[];
  clubId: string;
  currentUserId: string;
  myRole: ClubRole;
  pendingRequests?: PendingJoinRequest[];
  invitableFriends?: InvitableClubFriend[];
}

function JoinRequestRow({
  request,
  clubId,
}: {
  request: PendingJoinRequest;
  clubId: string;
}) {
  const store = useClubStore();
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const displayName = request.user.username ?? 'Unknown';

  const handleApprove = async () => {
    setApproving(true);
    await store.approveJoinRequest(request.id);
    setApproving(false);
    router.refresh();
  };

  const handleReject = async () => {
    setRejecting(true);
    await store.rejectJoinRequest(request.id);
    setRejecting(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a]">
      {request.user.imageUrl ? (
        <Image
          src={request.user.imageUrl}
          alt={displayName}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-[#FFC300]">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>
        <p className="text-xs text-white/80">
          Requested {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-green-500/25 text-green-400/80 hover:bg-green-500/10 transition-all"
        >
          {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={approving || rejecting}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400/80 hover:bg-red-500/10 transition-all"
        >
          {rejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          Reject
        </button>
      </div>
    </div>
  );
}

export default function MembersGrid({
  members,
  clubId,
  myRole,
  pendingRequests = [],
  invitableFriends = [],
}: MembersGridProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [showInvitePicker, setShowInvitePicker] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const user = m.user;
      const name = (user.username ?? '').toLowerCase();
      const matchesQuery = !q || name.includes(q);
      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [members, query, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: members.length };
    for (const m of members) {
      counts[m.role] = (counts[m.role] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  const isOwnerOrMod = myRole === 'OWNER' || myRole === 'MODERATOR';

  return (
    <div>
      {isOwnerOrMod && pendingRequests.length > 0 && (
        <div className="mb-6 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 p-4">
          <p className="text-sm font-semibold text-[#FFC300] mb-3">
            {pendingRequests.length} pending join request{pendingRequests.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <JoinRequestRow key={req.id} request={req} clubId={clubId} />
            ))}
          </div>
        </div>
      )}

      {isOwnerOrMod && (
        <div className="mb-5">
          <button
            onClick={() => setShowInvitePicker((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-[#FFC300]/80 hover:text-[#FFC300] border border-[#FFC300]/20 hover:border-[#FFC300]/40 px-4 py-2 rounded-xl bg-[#FFC300]/5 hover:bg-[#FFC300]/10 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Invite Friend
            {showInvitePicker ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showInvitePicker && (
            <div className="mt-3 rounded-xl border border-[#2a2a2a] bg-[#252525] p-3">
              <ClubInvitePicker
                clubId={clubId}
                friends={invitableFriends}
                onInvited={() => setShowInvitePicker(false)}
              />
            </div>
          )}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ROLE_TABS.map(({ value, label }) => {
          const count = roleCounts[value] ?? 0;
          if (value !== 'ALL' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => setRoleFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                roleFilter === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#252525] border border-[#2a2a2a] text-white hover:text-yellow-500 hover:border-[#3a3a3a]'
              }`}
            >
              {label}
              <span
                className={`text-sm ${roleFilter === value ? 'text-black' : 'text-yellow-500'}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search className="w-8 h-8 text-white/10 mb-3" />
          <p className="text-sm text-white/80">No members found.</p>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#FFC300]/80 hover:text-[#FFC300] transition-colors mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              clubId={clubId}
              myRole={myRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}
