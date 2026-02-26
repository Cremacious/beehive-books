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
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        confirm
          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          : 'bg-white/5 text-white/70 border border-[#333] hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30'
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
      {confirm ? 'End challenge?' : 'End Early'}
    </button>
  );
}
