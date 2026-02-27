'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { endPromptEarlyAction } from '@/lib/actions/prompt.actions';

export function EndPromptButton({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleEnd() {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    const result = await endPromptEarlyAction(promptId);
    setLoading(false);
    if (result.success) router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={handleEnd}
      onBlur={() => setConfirm(false)}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
      {confirm ? 'End challenge?' : 'End Early'}
    </Button>
  );
}
