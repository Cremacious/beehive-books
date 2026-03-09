'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/lib/stores/club-store';
import BackButton from '@/components/shared/back-button';

interface ClubGateProps {
  clubId: string;
  clubName: string;
  description: string;
  memberCount: number;
  joinRequestStatus: 'none' | 'pending';
  isSignedIn: boolean;
}

export default function ClubGate({
  clubId,
  clubName,
  description,
  memberCount,
  joinRequestStatus,
  isSignedIn,
}: ClubGateProps) {
  const store = useClubStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(joinRequestStatus === 'pending');
  const [error, setError] = useState('');

  const handleRequestJoin = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    setLoading(true);
    setError('');
    const result = await store.requestToJoin(clubId);
    setLoading(false);
    if (result.success) {
      setRequested(true);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="px-4 pt-6 md:px-8">
      <BackButton href="/clubs" label="Clubs" className="mb-6" />
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-[#252525] border border-[#2a2a2a] p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FFC300]/15 flex items-center justify-center mx-auto mb-5">
          <Users className="w-7 h-7 text-[#FFC300]" />
        </div>

        <h1 className="text-2xl font-bold text-white mainFont mb-2">{clubName}</h1>

        {description && (
          <p className="text-sm text-white/80 mb-4 leading-relaxed">{description}</p>
        )}

        <p className="text-xs text-white/60 mb-6">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </p>

        {requested ? (
          <div className="flex items-center justify-center gap-2 text-sm text-green-400 bg-green-400/10 rounded-xl px-4 py-3">
            <Check className="w-4 h-4 shrink-0" />
            Join request sent — waiting for owner approval
          </div>
        ) : (
          <Button
            onClick={handleRequestJoin}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignedIn ? 'Request to Join' : 'Sign in to Join'}
          </Button>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}
      </div>
    </div>
    </div>
  );
}
