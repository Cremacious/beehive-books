'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  FileText,
  Loader2,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';
import {
  parseManuscriptImportAction,
  saveReviewedImportChaptersAction,
} from '@/lib/actions/import.actions';
import type {
  ImportChapterDraft,
  ImportParseResult,
  ImportWarningCode,
} from '@/lib/import/manuscript';
import { cn } from '@/lib/utils';

type ImportReviewClientProps = {
  bookId: string;
  bookTitle: string;
};

type EditableChapter = ImportChapterDraft & {
  bodyText: string;
  enabled: boolean;
  bodyEdited: boolean;
};

const warningLabels: Record<ImportWarningCode, string> = {
  'long-title': 'Long title',
  'empty-content': 'Empty body',
  'duplicate-title': 'Duplicate title',
  'large-content': 'Large chapter',
  'fallback-title': 'Needs title',
};

function htmlToText(html: string) {
  if (typeof document === 'undefined') return html;

  const element = document.createElement('div');
  element.innerHTML = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n');

  return (element.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function toEditableChapters(result: ImportParseResult): EditableChapter[] {
  return result.chapters.map((chapter) => ({
    ...chapter,
    bodyText: htmlToText(chapter.content),
    enabled: !chapter.warnings.includes('empty-content'),
    bodyEdited: false,
  }));
}

export function ImportReviewClient({ bookId, bookTitle }: ImportReviewClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pastedText, setPastedText] = useState('');
  const [chapters, setChapters] = useState<EditableChapter[]>([]);
  const [sourceFormat, setSourceFormat] = useState<ImportParseResult['sourceFormat'] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enabledChapters = useMemo(
    () => chapters.filter((chapter) => chapter.enabled && chapter.title.trim() && chapter.bodyText.trim()),
    [chapters],
  );

  const warningCount = useMemo(
    () => chapters.reduce((total, chapter) => total + chapter.warnings.length, 0),
    [chapters],
  );

  function setStatus(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setIsError(error);
  }

  function parseImport() {
    const formData = new FormData();
    const file = fileInputRef.current?.files?.[0];

    formData.set('bookId', bookId);
    if (file) formData.set('file', file);
    formData.set('text', pastedText);

    startTransition(async () => {
      const result = await parseManuscriptImportAction(formData);
      if (!result.success) {
        setChapters([]);
        setSourceFormat(null);
        setStatus(result.message, true);
        return;
      }

      setChapters(toEditableChapters(result.result));
      setSourceFormat(result.result.sourceFormat);
      setStatus(`Found ${result.result.chapters.length} chapter${result.result.chapters.length === 1 ? '' : 's'}.`);
    });
  }

  function saveImport() {
    const payload = enabledChapters.map((chapter) => ({
      title: chapter.title.trim(),
      content: chapter.bodyEdited ? textToHtml(chapter.bodyText) : chapter.content,
    }));

    startTransition(async () => {
      const result = await saveReviewedImportChaptersAction(bookId, payload);
      if (!result.success) {
        setStatus(result.message, true);
        return;
      }

      setStatus(`Saved ${result.createdCount} chapter${result.createdCount === 1 ? '' : 's'}.`);
      setChapters([]);
      setPastedText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }

  function updateChapter(id: string, patch: Partial<EditableChapter>) {
    setChapters((current) => (
      current.map((chapter) => (
        chapter.id === id ? { ...chapter, ...patch } : chapter
      ))
    ));
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/write/${bookId}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/75 transition hover:border-[#FFC300]/40 hover:text-[#FFC300]"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Workspace
          </Link>
          <p className="mt-5 text-sm font-semibold text-[#FFC300] mainFont">Import manuscript</p>
          <h1 className="mt-2 break-words text-2xl font-bold text-white mainFont md:text-3xl">
            {bookTitle}
          </h1>
        </div>

        <TactileSurface as="aside" className="grid min-w-52 grid-cols-3 gap-3 p-4">
          <div>
            <p className="text-lg font-bold text-white mainFont">{chapters.length}</p>
            <p className="text-xs text-white/55">chapters</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white mainFont">{enabledChapters.length}</p>
            <p className="text-xs text-white/55">selected</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#FFC300] mainFont">{warningCount}</p>
            <p className="text-xs text-white/55">flags</p>
          </div>
        </TactileSurface>
      </header>

      <main className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <TactileSurface as="section" grit className="content-start p-5">
          <div className="flex items-center gap-2">
            <UploadCloud aria-hidden="true" className="h-5 w-5 text-[#FFC300]" />
            <h2 className="text-lg font-bold text-white mainFont">Source</h2>
          </div>

          <label className="mt-5 block text-sm font-bold text-white mainFont" htmlFor="manuscript-file">
            File
          </label>
          <input
            ref={fileInputRef}
            id="manuscript-file"
            name="file"
            type="file"
            accept=".docx,.txt,.md"
            className="mt-2 block w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#FFC300] file:px-3 file:py-2 file:text-sm file:font-bold file:text-black focus:border-[#FFC300]/60 focus:outline-none"
          />

          <label className="mt-5 block text-sm font-bold text-white mainFont" htmlFor="manuscript-text">
            Paste
          </label>
          <textarea
            id="manuscript-text"
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            rows={12}
            className="mt-2 block w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white focus:border-[#FFC300]/60 focus:outline-none"
          />

          <button
            type="button"
            onClick={parseImport}
            disabled={isPending}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#FFC300]/30 bg-[#FFC300] px-4 py-2 text-sm font-bold text-black shadow-[0_3px_0_#8f6d00] transition hover:bg-[#FFD040] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <FileText aria-hidden="true" className="h-4 w-4" />
            )}
            Review import
          </button>

          {message && (
            <div
              role={isError ? 'alert' : 'status'}
              className={cn(
                'mt-4 rounded-lg border px-3 py-2 text-sm',
                isError
                  ? 'border-red-400/30 bg-red-500/10 text-red-100'
                  : 'border-[#FFC300]/25 bg-[#FFC300]/10 text-[#FFE189]',
              )}
            >
              {message}
            </div>
          )}
        </TactileSurface>

        <section className="grid content-start gap-4">
          <TactileSurface as="section" className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-bold text-white mainFont">Review queue</p>
              <p className="mt-1 text-xs text-white/55">
                {sourceFormat ? sourceFormat.toUpperCase() : 'No import loaded'}
              </p>
            </div>
            <button
              type="button"
              onClick={saveImport}
              disabled={isPending || enabledChapters.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FFC300]/30 bg-[#FFC300] px-4 py-2 text-sm font-bold text-black shadow-[0_3px_0_#8f6d00] transition hover:bg-[#FFD040] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="h-4 w-4" />
              )}
              Save selected
            </button>
          </TactileSurface>

          {chapters.length === 0 ? (
            <TactileSurface as="section" className="grid min-h-72 place-items-center p-6 text-center">
              <div>
                <FileText aria-hidden="true" className="mx-auto h-10 w-10 text-[#FFC300]" />
                <p className="mt-4 text-base font-bold text-white mainFont">No chapters loaded</p>
              </div>
            </TactileSurface>
          ) : (
            chapters.map((chapter, index) => (
              <TactileSurface
                key={chapter.id}
                as="article"
                className={cn(
                  'p-4',
                  !chapter.enabled && 'opacity-55',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#FFC300]/12 px-2 text-sm font-bold text-[#FFC300]">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateChapter(chapter.id, { enabled: !chapter.enabled })}
                      className={cn(
                        'inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold transition',
                        chapter.enabled
                          ? 'border-[#FFC300]/35 bg-[#FFC300]/12 text-[#FFC300]'
                          : 'border-white/10 bg-white/5 text-white/55',
                      )}
                    >
                      <Check aria-hidden="true" className="h-4 w-4" />
                      {chapter.enabled ? 'Selected' : 'Skipped'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChapters((current) => current.filter((item) => item.id !== chapter.id))}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-white/65 transition hover:border-red-400/35 hover:text-red-100"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                {chapter.warnings.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chapter.warnings.map((warning) => (
                      <span
                        key={warning}
                        className="inline-flex items-center gap-1 rounded-full border border-[#FFC300]/25 bg-[#FFC300]/10 px-2.5 py-1 text-xs font-bold text-[#FFE189]"
                      >
                        <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                        {warningLabels[warning]}
                      </span>
                    ))}
                  </div>
                )}

                <label className="mt-4 block text-sm font-bold text-white mainFont" htmlFor={`${chapter.id}-title`}>
                  Title
                </label>
                <input
                  id={`${chapter.id}-title`}
                  value={chapter.title}
                  maxLength={100}
                  onChange={(event) => updateChapter(chapter.id, { title: event.target.value })}
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold text-white focus:border-[#FFC300]/60 focus:outline-none"
                />

                <label className="mt-4 block text-sm font-bold text-white mainFont" htmlFor={`${chapter.id}-body`}>
                  Body
                </label>
                <textarea
                  id={`${chapter.id}-body`}
                  value={chapter.bodyText}
                  rows={8}
                  onChange={(event) => updateChapter(chapter.id, {
                    bodyText: event.target.value,
                    bodyEdited: true,
                  })}
                  className="mt-2 block w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white focus:border-[#FFC300]/60 focus:outline-none"
                />
              </TactileSurface>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
