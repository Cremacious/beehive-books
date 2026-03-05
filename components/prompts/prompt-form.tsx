'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Search, X, Loader2, Users, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

function FriendAvatar({ user }: { user: FriendUser }) {
  const name = user.username || '?';
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={name}
          width={28}
          height={28}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[9px] font-bold text-[#FFC300]">
          {(name[0] || '?').toUpperCase()}
        </span>
      )}
    </div>
  );
}

function toDateInputValue(d: Date): string {
  return d.toISOString().split('T')[0];
}

function defaultEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toDateInputValue(d);
}

export function PromptForm({ mode, prompt, friends }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [inviteSearch, setInviteSearch] = useState('');

  const initialInvited = prompt?.invites.map((i) => i.user.clerkId) ?? [];
  const [invitedIds, setInvitedIds] = useState<string[]>(initialInvited);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: prompt?.title ?? '',
      description: prompt?.description ?? '',
      endDate: prompt ? toDateInputValue(prompt.endDate) : defaultEndDate(),
      isPublic: prompt?.isPublic ?? false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const isPublicValue = watch('isPublic');

  function toggleInvite(clerkId: string) {
    setInvitedIds((prev) =>
      prev.includes(clerkId)
        ? prev.filter((id) => id !== clerkId)
        : [...prev, clerkId],
    );
  }

  const filteredFriends = friends.filter((f) => {
    if (!inviteSearch) return true;
    const q = inviteSearch.toLowerCase();
    return f.username?.toLowerCase().includes(q);
  });

  async function onSubmit(data: PromptFormData) {
    setServerError('');

    if (mode === 'create') {
      const result = await createPromptAction(data, invitedIds);
      if (result.success && result.promptId) {
        router.push(`/prompts/${result.promptId}`);
      } else {
        setServerError(result.message);
      }
    } else {
      const result = await updatePromptAction(prompt!.id, data, invitedIds);
      if (result.success) {
        router.push(`/prompts/${prompt!.id}`);
      } else {
        setServerError(result.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Title
        </label>
        <input
          {...register('title')}
          placeholder="e.g. Write a scene where two strangers share an umbrella…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe the creative challenge, set the scene, give inspiration…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Challenge Deadline
        </label>
        <input
          type="date"
          {...register('endDate')}
          min={toDateInputValue(new Date(Date.now() + 86400000))}
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all scheme-dark"
        />
        {errors.endDate && (
          <p className="mt-1 text-xs text-red-400">
            {errors.endDate.message as string}
          </p>
        )}
        <p className="mt-1.5 text-sm text-white/80">
          Entries will be revealed to all participants when the deadline passes.
        </p>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {isPublicValue ? (
              <Globe className="w-4 h-4 text-[#FFC300]" />
            ) : (
              <Lock className="w-4 h-4 text-white/80" />
            )}
            <span className="text-sm font-medium text-white">
              {isPublicValue ? 'Public Challenge' : 'Private Challenge'}
            </span>
          </div>
          <p className="text-sm text-white/80">
            {isPublicValue
              ? 'Anyone on Beehive Books can join this challenge.'
              : 'Only people you invite can participate.'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer mt-0.5">
          <input
            type="checkbox"
            {...register('isPublic')}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#333] rounded-full peer peer-checked:bg-[#FFC300] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>

      {!isPublicValue && (
        <div>
          <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
            <Users className="inline w-3.5 h-3.5 mr-1 text-yellow-500" />
            Invite Friends
            {invitedIds.length > 0 && (
              <span className="ml-2 text-xs text-[#FFC300] font-normal">
                {invitedIds.length} selected
              </span>
            )}
          </label>

          {friends.length === 0 ? (
            <p className="text-sm text-white/80 py-3">
              You have no friends to invite yet.
            </p>
          ) : (
            <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#2a2a2a]">
                <Search className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <input
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  placeholder="Search friends…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              <ul className="max-h-48 overflow-y-auto">
                {filteredFriends.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-white/80">
                    No matches
                  </li>
                ) : (
                  filteredFriends.map((f) => {
                    const selected = invitedIds.includes(f.clerkId);
                    const name = f.username || 'Unknown';
                    return (
                      <li key={f.clerkId}>
                        <button
                          type="button"
                          onClick={() => toggleInvite(f.clerkId)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected ? 'bg-[#FFC300]/8' : 'hover:bg-white/4'
                          }`}
                        >
                          <FriendAvatar user={f} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {name}
                            </p>
                            {f.username && (
                              <p className="text-sm text-white/80">
                                @{f.username}
                              </p>
                            )}
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              selected
                                ? 'bg-[#FFC300] border-[#FFC300]'
                                : 'border-white/20'
                            }`}
                          >
                            {selected && (
                              <X className="w-2.5 h-2.5 text-black" />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {serverError && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
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
