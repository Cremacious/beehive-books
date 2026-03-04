'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PopupProps {
  open: boolean;
  onClose: () => void;
  /** Optional title shown in the header bar */
  title?: string;
  children: React.ReactNode;
  /** Controls the max-width of the panel. Defaults to 'lg'. */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const MAX_WIDTH_CLASS: Record<NonNullable<PopupProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Popup({
  open,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}: PopupProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${MAX_WIDTH_CLASS[maxWidth]} max-h-[85vh] flex flex-col rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-2xl`}
      >
        {/* Header — always shown so the close button is always reachable */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2a2a2a] shrink-0">
          {title && (
            <h2 className="flex-1 text-sm font-semibold text-white truncate">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
