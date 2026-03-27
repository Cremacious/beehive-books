'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
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
    <button
      onClick={handleEnd}
      onBlur={() => setConfirm(false)}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/80 border border-[#2a2a2a] hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
      {confirm ? 'Confirm?' : 'End Early'}
    </button>
  );
}
