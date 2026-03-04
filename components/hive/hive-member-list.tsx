'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Crown,
  Shield,
  Pencil,
  Eye,
  MoreHorizontal,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHiveStore } from '@/lib/stores/hive-store';
import { useRouter } from 'next/navigation';
import HiveInvitePicker from '@/components/hive/hive-invite-picker';
import type { HiveMemberWithUser, HiveRole, InvitableFriend } from '@/lib/types/hive.types';

const ROLE_ICONS: Record<HiveRole, React.ReactNode> = {
  OWNER: <Crown className="w-3.5 h-3.5 text-[#FFC300]" />,
  MODERATOR: <Shield className="w-3.5 h-3.5 text-blue-400" />,
  CONTRIBUTOR: <Pencil className="w-3.5 h-3.5 text-amber-400" />,
  BETA_READER: <Eye className="w-3.5 h-3.5 text-purple-400" />,
};

const ROLE_COLORS: Record<HiveRole, string> = {
  OWNER: 'text-[#FFC300]',
  MODERATOR: 'text-blue-400',
  CONTRIBUTOR: 'text-amber-400',
  BETA_READER: 'text-purple-400',
};

const ROLE_LABELS: Record<HiveRole, string> = {
  OWNER: 'Owner',
  MODERATOR: 'Moderator',
  CONTRIBUTOR: 'Contributor',
  BETA_READER: 'Beta Reader',
};

const ASSIGNABLE_ROLES: Exclude<HiveRole, 'OWNER' | 'BETA_READER'>[] = [
  'MODERATOR',
  'CONTRIBUTOR',
];

interface HiveMemberListProps {
  members: HiveMemberWithUser[];
  hiveId: string;
  myRole: HiveRole | null;
  currentUserId: string | null;
  invitableFriends?: InvitableFriend[];
}

export default function HiveMemberList({
  members,
  hiveId,
  myRole,
  currentUserId,
  invitableFriends = [],
}: HiveMemberListProps) {
  const store = useHiveStore();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInvitePicker, setShowInvitePicker] = useState(false);

  const canManage = myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleRemove = async (userId: string, username: string | null) => {
    if (!confirm(`Remove ${username ?? 'this member'} from the hive?`)) return;
    setLoadingId(userId);
    await store.removeMember(hiveId, userId);
    setLoadingId(null);
    router.refresh();
  };

  const handleRoleChange = async (
    userId: string,
    role: Exclude<HiveRole, 'OWNER'>,
  ) => {
    setLoadingId(userId);
    setOpenMenuId(null);
    await store.updateMemberRole(hiveId, userId, role);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
    
      {canManage && (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
          <button
            onClick={() => setShowInvitePicker((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#FFC300]" />
              Invite Friends
            </span>
            {invitableFriends.length > 0 && (
              <span className="text-xs text-white/40">
                {invitableFriends.length} available
              </span>
            )}
          </button>
          {showInvitePicker && (
            <div className="px-4 pb-4 border-t border-[#2a2a2a]">
              <div className="pt-3">
                <HiveInvitePicker
                  hiveId={hiveId}
                  friends={invitableFriends}
                  onInvited={() => router.refresh()}
                />
              </div>
            </div>
          )}
        </div>
      )}


      <div className="space-y-2">
      {members.map((member) => {
        const isMe = member.userId === currentUserId;
        const canEditThis =
          canManage &&
          !isMe &&
          member.role !== 'OWNER' &&
          !(myRole === 'MODERATOR' && member.role === 'MODERATOR');

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#252525] border border-[#2a2a2a]"
          >
            <Link
              href={`/u/${member.user.username ?? member.userId}`}
              className="shrink-0"
            >
              {member.user.imageUrl ? (
                <Image
                  src={member.user.imageUrl}
                  alt={member.user.username ?? 'User'}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFC300]/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/10">
                  <span className="text-[#FFC300] text-sm font-bold">
                    {(member.user.username ??
                      member.user.firstName ??
                      '?')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/u/${member.user.username ?? member.userId}`}
                className="text-sm font-semibold text-white hover:text-[#FFC300] transition-colors truncate block"
              >
                {member.user.username ??
                  [member.user.firstName, member.user.lastName]
                    .filter(Boolean)
                    .join(' ') ??
                  'Unknown'}
                {isMe && (
                  <span className="text-white/40 font-normal ml-1">(you)</span>
                )}
              </Link>
              <div
                className={`flex items-center gap-1 text-xs ${ROLE_COLORS[member.role as HiveRole]}`}
              >
                {ROLE_ICONS[member.role as HiveRole]}
                {ROLE_LABELS[member.role as HiveRole]}
              </div>
            </div>

            {canEditThis && (
              <div className="relative shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-white/40 hover:text-white"
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === member.userId ? null : member.userId,
                    )
                  }
                  disabled={loadingId === member.userId}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                {openMenuId === member.userId && (
                  <div className="absolute right-0 top-9 z-10 w-44 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden">
                    <div className="p-1">
                      <p className="text-[10px] text-white/40 px-2 py-1 uppercase tracking-wider">
                        Change role
                      </p>
                      {ASSIGNABLE_ROLES.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(member.userId, role)}
                          disabled={member.role === role}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-white hover:bg-white/5 disabled:opacity-40 transition-colors text-left"
                        >
                          {ROLE_ICONS[role]}
                          {ROLE_LABELS[role]}
                          {member.role === role && (
                            <span className="ml-auto text-[#FFC300]">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#2a2a2a] p-1">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          handleRemove(member.userId, member.user.username);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors text-left"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        Remove from hive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
