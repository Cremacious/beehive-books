'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UserPlus, Loader2, Check, Users } from 'lucide-react';
import { useClubStore } from '@/lib/stores/club-store';
import type { InvitableClubFriend } from '@/lib/types/club.types';

interface ClubInvitePickerProps {
  clubId: string;
  friends: InvitableClubFriend[];
  onInvited?: () => void;
}

export default function ClubInvitePicker({
  clubId,
  friends,
  onInvited,
}: ClubInvitePickerProps) {
  const store = useClubStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (friendClerkId: string) => {
    setLoadingId(friendClerkId);
    setError(null);
    const result = await store.inviteToClub(clubId, friendClerkId);
    setLoadingId(null);
    if (result.success) {
      setSuccessIds((prev) => new Set(prev).add(friendClerkId));
      onInvited?.();
    } else {
      setError(result.message);
    }
  };

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center gap-2">
        <Users className="w-6 h-6 text-white/20" />
        <p className="text-sm text-white/40">No friends available to invite.</p>
        <p className="text-xs text-white/25">
          All your friends are already members or have pending invites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {friends.map((friend) => {
          const invited = successIds.has(friend.clerkId);
          const loading = loadingId === friend.clerkId;
          const displayName = friend.username ?? 'Unknown';

          return (
            <div
              key={friend.clerkId}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a]"
            >
              {friend.imageUrl ? (
                <Image
                  src={friend.imageUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
                  <span className="text-[#FFC300] text-xs font-bold">
                    {displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}

              <span className="flex-1 text-sm text-white truncate">{displayName}</span>

              <button
                onClick={() => !invited && handleInvite(friend.clerkId)}
                disabled={loading || invited}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                  invited
                    ? 'border-green-400/25 text-green-400/70 bg-green-400/8'
                    : 'border-[#FFC300]/25 text-[#FFC300]/80 hover:bg-[#FFC300]/10 hover:border-[#FFC300]/40'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : invited ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                {invited ? 'Invited' : 'Invite'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
