'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { deletePromptAction } from '@/lib/actions/prompt.actions';

export function DeletePromptButton({ promptId }: { promptId: string }) {
  const router = useRouter();

  return (
    <DeleteDialog
      itemType="prompt"
      onDelete={async () => {
        const result = await deletePromptAction(promptId);
        if (!result.success) throw new Error(result.message);
        router.push('/prompts');
      }}
      trigger={
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/80 border border-[#2a2a2a] hover:text-white hover:border-white/20 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      }
    />
  );
}
