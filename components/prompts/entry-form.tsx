'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { entrySchema, type EntryFormData } from '@/lib/validations/prompt.schema';
import { createEntryAction } from '@/lib/actions/prompt.actions';

interface Props {
  promptId: string;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EntryForm({ promptId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: { content: '' },
  });

  const contentValue = watch('content');
  const wordCount    = countWords(contentValue || '');

  async function onSubmit(data: EntryFormData) {
    setServerError('');
    const result = await createEntryAction(promptId, data.content);
    if (result.success) {
      router.push(`/prompts/${promptId}`);
      router.refresh();
    } else {
      setServerError(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/80">Your Entry</label>
          <span className="flex items-center gap-1.5 text-xs text-white/70">
            <FileText className="w-3 h-3" />
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
        </div>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              content={field.value}
              onChange={field.onChange}
              editable={true}
            />
          )}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      <p className="text-xs text-white/70">
        Take your time — you can only submit one entry. Make it count!
      </p>

      {serverError && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">{serverError}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting || wordCount === 0}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Entry
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
