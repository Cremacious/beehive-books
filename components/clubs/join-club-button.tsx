'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Crown, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/lib/stores/club-store';

interface JoinClubButtonProps {
  clubId: string;
  isMember: boolean;
  isOwner: boolean;
  memberCount: number;
  className?: string;
}

export default function JoinClubButton({
  clubId,
  isMember,
  isOwner,
  className,
}: JoinClubButtonProps) {
  const router = useRouter();
  const store = useClubStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isOwner) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#FFC300] bg-[#FFC300]/10 border border-[#FFC300]/20 ${className ?? ''}`}>
        <Crown className="w-4 h-4" />
        You own this club
      </span>
    );
  }

  const handleJoin = async () => {
    setError('');
    setLoading(true);
    const result = await store.joinClub(clubId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this club? You can rejoin later.')) return;
    setError('');
    setLoading(true);
    const result = await store.leaveClub(clubId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className={`flex flex-col items-start gap-1 ${className ?? ''}`}>
      {isMember ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLeave}
          disabled={loading}
          className="w-full border-red-400/30 text-red-400 hover:border-red-400/60 hover:text-red-300 hover:bg-red-400/10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Leave Club
        </Button>
      ) : (
        <Button size="sm" onClick={handleJoin} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Join Club
        </Button>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
