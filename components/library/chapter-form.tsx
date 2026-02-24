'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2 } from 'lucide-react';
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

type ExistingChapter = {
  id: string;
  title: string;
  authorNotes: string | null;
  content: string | null;
};

type ChapterFormProps = {
  mode: 'create' | 'edit';
  cancelHref: string;
  bookId: string;
  chapter?: ExistingChapter;
};

export function ChapterForm({
  mode,
  cancelHref,
  bookId,
  chapter,
}: ChapterFormProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: chapter?.title ?? '',
      authorNotes: chapter?.authorNotes ?? '',
      content: chapter?.content ?? '',
    },
  });

  async function onSubmit(data: ChapterFormData) {
    setServerError('');
    let result;
    if (isEdit && chapter) {
      result = await updateChapterAction(bookId, chapter.id, data);
    } else {
      result = await createChapterAction(bookId, data);
    }

    if (result.success) {
      router.push(cancelHref);
    } else {
      setServerError(result.message);
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
          {/* Title + Author Notes */}
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
                <span className="ml-2 text-xs text-white/30 font-normal">
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
              <p className="text-xs text-white/30">
                Shown to readers in a highlighted box before the chapter
                content.
              </p>
            </div>
          </div>

          {/* Rich Text Editor */}
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

          <div className="flex items-center justify-between">
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
              <Link
                href={cancelHref}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/6 transition-all duration-200"
              >
                Cancel
              </Link>
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
