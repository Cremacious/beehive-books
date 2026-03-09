'use client';

import { useRouter } from 'next/navigation';
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
    />
  );
}
