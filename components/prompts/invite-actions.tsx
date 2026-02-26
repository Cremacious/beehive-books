'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { acceptInviteAction, declineInviteAction } from '@/lib/actions/prompt.actions';

interface Props {
  promptId: string;
}

export function InviteActions({ promptId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);

  async function handle(action: 'accept' | 'decline') {
    setLoading(action);
    const result = action === 'accept'
      ? await acceptInviteAction(promptId)
      : await declineInviteAction(promptId);
    setLoading(null);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle('accept')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#FFD54F] disabled:opacity-50 transition-colors"
      >
        {loading === 'accept' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Accept
      </button>
      <button
        onClick={() => handle('decline')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-[#333] text-white/70 text-xs font-semibold hover:bg-white/10 disabled:opacity-50 transition-colors"
      >
        {loading === 'decline' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        Decline
      </button>
    </div>
  );
}
