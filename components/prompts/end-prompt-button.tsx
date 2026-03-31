'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
import { endPromptEarlyAction } from '@/lib/actions/prompt.actions';
import Popup from '@/components/ui/popup';
import { Button } from '@/components/ui/button';

interface Props {
  promptId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EndPromptButton({ promptId, open: controlledOpen, onOpenChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  const open = isControlled ? controlledOpen! : internalOpen;
  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  async function handleEnd() {
    setLoading(true);
    const result = await endPromptEarlyAction(promptId);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/80 border border-[#2a2a2a] hover:text-white hover:border-white/20 transition-all"
        >
          <Flag className="w-3.5 h-3.5" />
          End Early
        </button>
      )}
      <Popup
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="End Challenge Early?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/80">
            Voting will open immediately for 48 hours. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <button
              onClick={handleEnd}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#FFC300] text-black hover:bg-[#FFD040] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
              End Challenge
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
