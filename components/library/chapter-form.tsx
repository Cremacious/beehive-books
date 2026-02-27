'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, FileText, FolderOpen, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  chapterSchema,
  type ChapterFormData,
} from '@/lib/validations/chapter.schema';
import {
  createChapterAction,
  updateChapterAction,
  deleteChapterAction,
} from '@/lib/actions/book.actions';
import { ChapterFormProps } from '@/lib/types/books.types';
import { parseSingleChapterDocxAction } from '@/lib/actions/docx.actions';
export function ChapterForm({
  mode,
  cancelHref,
  bookId,
  chapter,
  collections = [],
}: ChapterFormProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [contentMode, setContentMode] = useState<'write' | 'upload'>('write');
  const [docxParsing, setDocxParsing] = useState(false);
  const [docxError, setDocxError] = useState('');
  const [docxFileName, setDocxFileName] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: chapter?.title ?? '',
      authorNotes: chapter?.authorNotes ?? '',
      content: chapter?.content ?? '',
      collectionId: chapter?.collectionId ?? null,
    },
  });

  const currentTitle = watch('title');

  async function handleDocxUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocxError('');
    setDocxParsing(true);
    setDocxFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const result = await parseSingleChapterDocxAction(formData);

    setDocxParsing(false);

    if (!result.success) {
      setDocxError(result.message);
      setDocxFileName('');
      return;
    }

    setValue('content', result.content, { shouldValidate: true });

    if (result.title && !currentTitle?.trim()) {
      setValue('title', result.title, { shouldValidate: true });
    }

    setContentMode('write');
  }

  async function onSubmit(data: ChapterFormData) {
    setServerError('');
    const submitData = {
      ...data,
      collectionId: data.collectionId || null,
    };

    if (isEdit && chapter) {
      const result = await updateChapterAction(bookId, chapter.id, submitData);
      if (result.success) router.push(cancelHref);
      else setServerError(result.message);
    } else {
      const result = await createChapterAction(bookId, submitData);
      if (result.success && result.chapterId) {
        router.push(`/library/${bookId}/${result.chapterId}`);
      } else {
        setServerError(result.message);
      }
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    const result = await deleteChapterAction(bookId, chapter!.id);
    if (result.success) router.push(`/library/${bookId}`);
    else {
      setIsDeleting(false);
      setServerError(result.message);
    }
  }

  const inputClass =
    'w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white ' +
    'placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Chapter' : 'New Chapter'}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isEdit
              ? 'Update chapter details and content.'
              : 'Write and publish a new chapter.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Chapter Title <span className="text-red-400">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter your chapter title…"
                className={inputClass}
              />
              {errors.title && (
                <p className={errorClass}>{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Author&apos;s Notes
                <span className="ml-2 text-xs text-white/70 font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                {...register('authorNotes')}
                rows={isEdit ? 4 : 3}
                placeholder="Share thoughts, context, or a message to your readers…"
                className={inputClass + ' resize-y'}
              />
              {errors.authorNotes && (
                <p className={errorClass}>{errors.authorNotes.message}</p>
              )}
              <p className="text-xs text-white">
                Shown to readers in a highlighted box before the chapter
                content.
              </p>
            </div>

            {collections.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/75 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-yellow-500" />
                  Collection
                  <span className="ml-1 text-xs text-white/70 font-normal">
                    (optional)
                  </span>
                </label>
                <select
                  {...register('collectionId')}
                  className={inputClass + ' appearance-none'}
                >
                  <option value="">No collection</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden flex">
              <button
                type="button"
                onClick={() => { setContentMode('write'); setDocxError(''); }}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  contentMode === 'write'
                    ? 'bg-[#FFC300]/10 text-[#FFC300]'
                    : 'text-white/45 hover:text-white/65 hover:bg-white/4'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => { setContentMode('upload'); setDocxError(''); }}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-l border-[#2a2a2a] ${
                  contentMode === 'upload'
                    ? 'bg-[#FFC300]/10 text-[#FFC300]'
                    : 'text-white/45 hover:text-white/65 hover:bg-white/4'
                }`}
              >
                Upload DOCX
              </button>
            </div>
          )}

          {!isEdit && contentMode === 'upload' && (
            <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white/75">Upload a .docx file</p>
                <p className="text-xs text-white/40">
                  The document content will become the chapter body. If the document starts with a
                  Heading 1, that text will be suggested as the chapter title (only if you have not
                  already filled in a title).
                </p>
              </div>

              <label className="flex flex-col items-center justify-center gap-3 w-full h-32 rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#1e1e1e] cursor-pointer hover:border-[#FFC300]/40 transition-colors">
                {docxParsing ? (
                  <Loader2 className="w-6 h-6 text-[#FFC300]/50 animate-spin" />
                ) : docxFileName ? (
                  <>
                    <FileText className="w-6 h-6 text-[#FFC300]/70" />
                    <span className="text-xs text-white/60">{docxFileName}</span>
                    <span className="text-[10px] text-white/30">Click to replace</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-white/25" />
                    <span className="text-xs text-white/35">Click to select a .docx file</span>
                    <span className="text-[10px] text-white/20">Max 10 MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  disabled={docxParsing}
                  onChange={handleDocxUpload}
                />
              </label>

              {docxError && (
                <p className="text-xs text-red-400">{docxError}</p>
              )}
            </div>
          )}

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />

          {(serverError || errors.content) && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">
                {serverError || errors.content?.message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
              >
                {isDeleting
                  ? 'Deleting…'
                  : deleteConfirm
                    ? 'Confirm delete?'
                    : 'Delete Chapter'}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href={cancelHref}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{' '}
                    {isEdit ? 'Saving…' : 'Creating…'}
                  </>
                ) : isEdit ? (
                  'Save Changes'
                ) : (
                  'Create Chapter'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
