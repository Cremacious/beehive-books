'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <Button
      variant="destructive"
      onClick={handleDelete}
      onBlur={() => setConfirm(false)}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      {confirm ? 'Confirm delete?' : 'Delete'}
    </Button>
  );
}
