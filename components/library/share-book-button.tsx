'use client';

import { useState } from 'react';
import { Share2, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { exportBookToDocxAction, exportBookToEpubAction } from '@/lib/actions/export.actions';
import { getBookForExportAction } from '@/lib/actions/book.actions';

interface ShareBookButtonProps {
  bookId: string;
  variant?: 'default' | 'icon';
  isOwner?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export function ShareBookButton({ bookId, variant = 'default', isOwner = false, className, size = 'sm' }: ShareBookButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingEpub, setExportingEpub] = useState(false);
  const [exportError, setExportError] = useState('');

  function getShareUrl() {
    return `${window.location.origin}/books/${bookId}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDocxExport() {
    setExportingDocx(true);
    setExportError('');
    try {
      const result = await exportBookToDocxAction(bookId);
      if (!result.success || !result.base64) {
        setExportError(result.message ?? 'Export failed.');
        return;
      }
      const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename ?? 'book.docx';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingDocx(false);
    }
  }

  async function handlePdfExport() {
    setExportingPdf(true);
    setExportError('');
    try {
      const data = await getBookForExportAction(bookId);
      const { exportBookToPdf } = await import('@/lib/utils/export-pdf');
      await exportBookToPdf(data.book, data.chapters);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'PDF export failed.');
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleEpubExport() {
    setExportingEpub(true);
    setExportError('');
    try {
      const result = await exportBookToEpubAction(bookId);
      if (!result.success || !result.base64) {
        setExportError(result.message ?? 'Export failed.');
        return;
      }
      const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/epub+zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename ?? 'book.epub';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingEpub(false);
    }
  }

  return (
    <>
      {variant === 'icon' ? (
        <Button variant="outline" size="icon-sm" onClick={() => setOpen(true)} className={className}>
          <Share2 />
        </Button>
      ) : (
        <Button variant="outline" size={size} onClick={() => setOpen(true)} className={className}>
          <Share2 className="w-3.5 h-3.5" />
          Share/Export
        </Button>
      )}

      <Popup open={open} onClose={() => setOpen(false)} title="Share" maxWidth="sm">
        <div className="space-y-4">

          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Share Link</p>
            <div className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2.5">
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

 
          {isOwner && (
            <div className="space-y-2 pt-1 border-t border-[#2a2a2a]">
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider pt-1">Export</p>
              {exportError && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
                  {exportError}
                </p>
              )}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleDocxExport}
                    disabled={exportingDocx || exportingPdf || exportingEpub}
                  >
                    {exportingDocx ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {exportingDocx ? 'Exporting…' : 'DOCX'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handlePdfExport}
                    disabled={exportingDocx || exportingPdf || exportingEpub}
                  >
                    {exportingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {exportingPdf ? 'Exporting…' : 'PDF'}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleEpubExport}
                  disabled={exportingDocx || exportingPdf || exportingEpub}
                >
                  {exportingEpub ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {exportingEpub ? 'Exporting…' : 'EPUB (Experimental)'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Popup>
    </>
  );
}
