'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/lib/stores/club-store';

interface ClubInviteActionsProps {
  inviteId: string;
  clubId: string;
}

export function ClubInviteActions({ inviteId, clubId }: ClubInviteActionsProps) {
  const store = useClubStore();
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    const result = await store.acceptClubInvite(inviteId);
    setAccepting(false);
    if (result.success) {
      router.push(`/clubs/${clubId}`);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    await store.declineClubInvite(inviteId);
    setDeclining(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button size="sm" onClick={handleAccept} disabled={accepting || declining}>
        {accepting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDecline}
        disabled={accepting || declining}
      >
        {declining ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        Decline
      </Button>
    </div>
  );
}
