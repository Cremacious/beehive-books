'use client';

import Popup from '@/components/ui/popup';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  description = 'This action cannot be undone.',
  loading = false,
}: Props) {
  return (
    <Popup open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-white/70 mb-6">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Popup>
  );
}
