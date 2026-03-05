'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Trash2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/lib/stores/club-store';
import { clubSchema } from '@/lib/validations/club.schema';
import type { ClubSchemaData } from '@/lib/validations/club.schema';
import type { ClubFormProps } from '@/lib/types/club.types';

const PRIVACY_OPTIONS = [
  {
    value: 'PUBLIC' as const,
    label: 'Public',
    desc: 'Anyone can find and join this club',
    Icon: Globe,
  },
  {
    value: 'PRIVATE' as const,
    label: 'Private',
    desc: 'Invite only — hidden from search',
    Icon: Lock,
  },
];

export default function ClubForm({
  mode,
  clubId,
  defaultValues,
  cancelHref,
}: ClubFormProps) {
  const router = useRouter();
  const store = useClubStore();

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ClubSchemaData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      privacy: defaultValues?.privacy ?? 'PUBLIC',
      rules: defaultValues?.rules ?? '',
      tags: defaultValues?.tags ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const privacy = watch('privacy');

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t) || tags.length >= 10) return;
    const next = [...tags, t];
    setTags(next);
    setValue('tags', next);
    setTagInput('');
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    setValue('tags', next);
  }

  const onSubmit = async (data: ClubSchemaData) => {
    setError('');
    const payload = { ...data, tags };

    if (mode === 'create') {
      const result = await store.createClub(payload);
      if (result.success && result.clubId) {
        router.push(`/clubs/${result.clubId}`);
      } else {
        setError(result.message);
      }
    } else {
      const result = await store.updateClub(clubId!, payload);
      if (result.success) {
        router.push(`/clubs/${clubId}`);
      } else {
        setError(result.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this club? This cannot be undone.')) return;
    setDeleting(true);
    const result = await store.deleteClub(clubId!);
    if (result.success) {
      router.push('/clubs');
    } else {
      setError(result.message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Club Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Midnight Mystery Readers…"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.name && (
          <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Description{' '}
          <span className="text-white/80 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="What is this club about? What kinds of books do you read?"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Privacy
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc, Icon }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  privacy === value
                    ? 'border-[#FFC300]/50 bg-[#FFC300]/8'
                    : 'border-[#2a2a2a] bg-[#252525]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    privacy === value ? 'text-[#FFC300]' : 'text-white/80'
                  }`}
                />
                <div>
                  <span
                    className={`text-xs font-semibold block ${
                      privacy === value ? 'text-[#FFC300]' : 'text-white'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-white/80 leading-tight block mt-0.5">
                    {desc}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-400 mt-1">{errors.privacy.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Club Rules{' '}
          <span className="text-white/80 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('rules')}
          rows={4}
          placeholder="Any rules or guidelines for members? e.g. Be respectful, finish the book before posting spoilers…"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.rules && (
          <p className="text-xs text-red-400 mt-1">{errors.rules.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Tags <span className="text-white/80 font-normal">(up to 10)</span>
        </label>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. fantasy, sci-fi, thriller…"
              className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
              className="px-3 py-2 rounded-lg bg-[#FFC300]/15 text-[#FFC300] hover:bg-[#FFC300]/25 disabled:opacity-30 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-white bg-[#1e1e1e] border border-[#3a3a3a] rounded-full px-2.5 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-white/80 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/80 text-center py-1">
              No tags yet — tags help others find your club.
            </p>
          )}
        </div>
        {errors.tags && (
          <p className="text-xs text-red-400 mt-1">{errors.tags.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Invite Friends
        </label>
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#252525] p-5 flex flex-col items-center justify-center text-center gap-1.5">
          <p className="text-sm font-medium text-white/80">
            Invites coming soon
          </p>
          <p className="text-xs text-white/80">
            Friend invites will be available in a future update. Share the club
            link to invite others.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === 'edit' ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Club
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" asChild>
            <a href={cancelHref}>Cancel</a>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'create' ? 'Create Club' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
