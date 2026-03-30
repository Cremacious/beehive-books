'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { FriendInvitePicker } from '@/components/shared/friend-invite-picker';
import {
  promptSchema,
  type PromptFormData,
} from '@/lib/validations/prompt.schema';
import {
  createPromptAction,
  updatePromptAction,
} from '@/lib/actions/prompt.actions';
import type { PromptDetail } from '@/lib/types/prompt.types';
import type { FriendUser } from '@/lib/actions/friend.actions';

interface Props {
  mode: 'create' | 'edit';
  prompt?: PromptDetail;
  friends: FriendUser[];
  pendingFriends?: FriendUser[];
}

function toDateInputValue(d: Date): string {
  return d.toISOString().split('T')[0];
}

function defaultEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toDateInputValue(d);
}

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE' as const, label: 'Private', desc: 'Only invited friends can participate' },
  { value: 'FRIENDS' as const, label: 'Friends', desc: 'All your friends can join' },
  { value: 'PUBLIC' as const, label: 'Public', desc: 'Anyone on Beehive Books can join' },
];

export function PromptForm({ mode, prompt, friends, pendingFriends = [] }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const pendingIds = new Set(pendingFriends.map((f) => f.id));
  const initialInvited = prompt?.invites.map((i) => i.user.id).filter((id) => !pendingIds.has(id)) ?? [];
  const [invitedIds, setInvitedIds] = useState<string[]>(initialInvited);
  const [tags, setTags] = useState<string[]>(prompt?.tags ?? []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: prompt?.title ?? '',
      description: prompt?.description ?? '',
      endDate: prompt ? toDateInputValue(prompt.endDate) : defaultEndDate(),
      privacy: prompt?.privacy ?? 'PRIVATE',
      explorable: prompt?.explorable ?? false,
      tags: prompt?.tags ?? [],
    },
  });

  const privacyValue = watch('privacy');
  const explorableValue = watch('explorable');

  async function onSubmit(data: PromptFormData) {
    setServerError('');

    if (mode === 'create') {
      const result = await createPromptAction({ ...data, tags }, invitedIds);
      if (result.success && result.promptId) {
        router.push(`/prompts/${result.promptId}`);
      } else {
        setServerError(result.message);
      }
    } else {
      const result = await updatePromptAction(prompt!.id, { ...data, tags }, [...invitedIds, ...pendingFriends.map((f) => f.id)]);
      if (result.success) {
        router.push(`/prompts/${prompt!.id}`);
      } else {
        setServerError(result.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Title <span className="text-white/80 text-sm font-normal">(required)</span>
        </label>
        <p className="text-sm text-white/80">A short, inspiring challenge title.</p>
        <input
          {...register('title')}
          placeholder="e.g. Write a scene where two strangers share an umbrella…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        <p className="text-sm text-white/80 text-right">{watch('title')?.length ?? 0} / 100</p>
        {errors.title && (
          <p className="text-sm text-white/80">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Description <span className="text-white/80 text-sm font-normal">(required)</span>
        </label>
        <p className="text-sm text-white/80">The full prompt — give writers something to react to.</p>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe the creative challenge, set the scene, give inspiration…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        <p className="text-sm text-white/80 text-right">{watch('description')?.length ?? 0} / 1000</p>
        {errors.description && (
          <p className="text-sm text-white/80">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-base font-medium text-white mb-1.5">
          Tags <span className="text-white/80 text-sm font-normal">(up to 10)</span>
        </label>
        <TagInput
          value={tags}
          onChange={(next) => { setTags(next); setValue('tags', next); }}
          emptyMessage="No tags yet. Tags help readers find your book."
          error={errors.tags?.message}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Challenge Deadline
        </label>
        <p className="text-sm text-white/80">When submissions close. Voting opens automatically after this.</p>
        <input
          type="date"
          {...register('endDate')}
          min={toDateInputValue(new Date(Date.now() + 86400000))}
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all scheme-dark"
        />
        {errors.endDate && (
          <p className="text-sm text-white/80">
            {errors.endDate.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-base font-medium text-white">
          Privacy
        </label>
        <p className="text-sm text-white/80">Public prompts appear in Explore and attract more entries.</p>
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div className="flex flex-col p-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] peer-checked:border-[#FFC300]/50 peer-checked:bg-[#FFC300]/8 transition-all">
                <span className="text-sm font-semibold text-white peer-checked:text-[#FFC300]">
                  {label}
                </span>
                <span className="text-sm text-white/80 mt-0.5 leading-tight">
                  {desc}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-sm text-white/80">{errors.privacy.message}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Compass className="w-4 h-4 text-[#FFC300]" />
            <span className="text-base font-medium text-white">Explorable</span>
          </div>
          <p className="text-sm text-white/80">
            List this prompt on the Explore page so all users can discover it.
            Enabling this will make the challenge public.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !explorableValue;
            setValue('explorable', next);
            if (next) setValue('privacy', 'PUBLIC');
          }}
          className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
            explorableValue ? 'bg-[#FFC300]' : 'bg-[#3a3a3a]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              explorableValue ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {(friends.length > 0 || pendingFriends.length > 0) && (
        <FriendInvitePicker
          friends={friends}
          pendingFriends={pendingFriends}
          selectedIds={invitedIds}
          onChange={setInvitedIds}
        />
      )}

      {serverError && (
        <p className="text-sm text-white/80 bg-white/5 rounded-xl px-4 py-2.5">
          {serverError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create Challenge' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
