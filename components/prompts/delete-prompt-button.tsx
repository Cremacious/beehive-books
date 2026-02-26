'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deletePromptAction } from '@/lib/actions/prompt.actions';

export function DeletePromptButton({ promptId }: { promptId: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    const result = await deletePromptAction(promptId);
    setLoading(false);
    if (result.success) router.push('/prompts');
  }

  return (
    <button
      onClick={handleDelete}
      onBlur={() => setConfirm(false)}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        confirm
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'bg-white/5 text-white/70 border border-[#333] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      {confirm ? 'Confirm delete?' : 'Delete'}
    </button>
  );
}
