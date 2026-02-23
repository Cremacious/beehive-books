'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

type ExistingChapter = {
  title:       string;
  authorNotes: string;
  content:     string;
};

type ChapterFormProps = {
  mode:        'create' | 'edit';
  cancelHref:  string;
  chapter?:    ExistingChapter;
  // error?: string    — wire in when adding logic
  // isPending?: boolean
};

export function ChapterForm({ mode, cancelHref, chapter }: ChapterFormProps) {
  const isEdit = mode === 'edit';

  const inputClass =
    'w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white ' +
    'placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Chapter' : 'New Chapter'}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isEdit ? 'Update chapter details and content.' : 'Write and publish a new chapter.'}
          </p>
        </div>

        <form className="space-y-6">

          {/* Chapter title */}
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Chapter Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                defaultValue={chapter?.title}
                placeholder="Enter your chapter title…"
                className={inputClass}
              />
            </div>

            {/* Author's notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Author&apos;s Notes
                <span className="ml-2 text-xs text-white/30 font-normal">(optional)</span>
              </label>
              <textarea
                name="authorNotes"
                rows={isEdit ? 4 : 3}
                defaultValue={chapter?.authorNotes}
                placeholder="Share thoughts, context, or a message to your readers…"
                className={inputClass + ' resize-y'}
              />
              <p className="text-xs text-white/30">
                Shown to readers in a highlighted box before the chapter content.
              </p>
            </div>
          </div>

          {/* Rich text editor */}
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
            {/* Toolbar placeholder */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-[#2a2a2a] flex-wrap">
              {['B', 'I', 'U', '—', 'H1', 'H2', '—', '≡', '⇥', '—', '"', '—', '↩'].map((tool, i) =>
                tool === '—' ? (
                  <span key={i} className="w-px h-4 bg-[#333] mx-1" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    className="w-7 h-7 rounded-lg text-xs font-bold text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                  >
                    {tool}
                  </button>
                )
              )}
            </div>

            {/* Editor area */}
            <div className="min-h-[420px] p-6">
              {chapter?.content ? (
                /* Pre-filled content for edit mode */
                <div
                  className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              ) : (
                <p className="text-white/20 text-sm italic select-none">
                  Begin your chapter here…
                </p>
              )}
              {/* RichTextEditor component will replace this area */}
            </div>
          </div>

          {/* Error */}
          {false && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            {isEdit ? (
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all duration-200"
              >
                Delete Chapter
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Link
                href={cancelHref}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-all duration-200 disabled:opacity-50"
              >
                {isEdit ? 'Save Changes' : 'Create Chapter'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
