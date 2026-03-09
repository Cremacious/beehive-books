'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';

interface ShareBookButtonProps {
  bookId: string;
  variant?: 'default' | 'icon';
}

export function ShareBookButton({ bookId, variant = 'default' }: ShareBookButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    return `${window.location.origin}/books/${bookId}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {variant === 'icon' ? (
        <Button variant="outline" size="icon-sm" onClick={() => setOpen(true)}>
          <Share2 />
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      )}

      <Popup open={open} onClose={() => setOpen(false)} title="Share" maxWidth="sm">
        <div className="space-y-3">
          <p className="text-sm text-white/80">Share this book with others.</p>

          <div className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2.5">
            <span className="flex-1 text-sm text-white/80 truncate">
              {typeof window !== 'undefined' ? getShareUrl() : `/books/${bookId}`}
            </span>
          </div>

          <Button className="w-full" onClick={handleCopy} disabled={copied}>
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </Button>
        </div>
      </Popup>
    </>
  );
}
