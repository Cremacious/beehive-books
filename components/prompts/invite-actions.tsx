'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <Button size="sm" onClick={() => handle('accept')} disabled={!!loading}>
        {loading === 'accept' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Accept
      </Button>
      <Button variant="outline" size="sm" onClick={() => handle('decline')} disabled={!!loading}>
        {loading === 'decline' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        Decline
      </Button>
    </div>
  );
}
