'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';

interface DeleteDialogProps {
  /** What is being deleted — shown in the confirmation message. E.g. "chapter", "book", "comment" */
  itemType: string;
  /** Optional name of the specific item — shown in quotes. E.g. "My First Novel" */
  itemName?: string;
  /** Called when the user confirms deletion. Should perform the delete and return/throw. */
  onDelete: () => Promise<void>;
  /** The trigger element. Defaults to a destructive button labelled "Delete {itemType}". */
  trigger?: React.ReactNode;
  /** Controlled open state. If provided, the component acts as a controlled dialog (no internal trigger click handler). */
  open?: boolean;
  /** Called when the dialog requests to close (controlled mode). */
  onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({
  itemType,
  itemName,
  onDelete,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: DeleteDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const open = isControlled ? controlledOpen! : internalOpen;
  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await onDelete();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setDeleting(false);
    }
  }

  const label = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

  return (
    <>
      {!isControlled && (
        <span onClick={() => setOpen(true)}>
          {trigger ?? (
            <Button variant="destructive" type="button">
              <Trash2 className="w-4 h-4" />
              {label}
            </Button>
          )}
        </span>
      )}

      <Popup open={open} onClose={() => !deleting && setOpen(false)} title={label} maxWidth="sm">
        <div className="space-y-4">
          <p className="text-sm text-white/80">
            Are you sure you want to permanently delete{' '}
            {itemName ? (
              <>
                <span className="font-semibold text-white">&ldquo;{itemName}&rdquo;</span>?
              </>
            ) : (
              <>this {itemType}?</>
            )}{' '}
            This action cannot be undone.
          </p>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={deleting}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              type="button"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {label}
                </>
              )}
            </Button>
          </div>
        </div>
      </Popup>
    </>
  );
}
