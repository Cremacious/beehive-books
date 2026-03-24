'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Compass } from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { FriendInvitePicker } from '@/components/shared/friend-invite-picker';
import { useClubStore } from '@/lib/stores/club-store';
import { clubSchema } from '@/lib/validations/club.schema';
import type { ClubSchemaData } from '@/lib/validations/club.schema';
import type { ClubFormProps } from '@/lib/types/club.types';
import type { FriendUser } from '@/lib/actions/friend.actions';

const PRIVACY_OPTIONS = [
  { value: 'PRIVATE' as const, label: 'Private', desc: 'Invite only — hidden from search' },
  { value: 'FRIENDS' as const, label: 'Friends', desc: 'Visible to your friends only' },
  { value: 'PUBLIC' as const, label: 'Public', desc: 'Anyone can find and request to join' },
];

export default function ClubForm({
  mode,
  clubId,
  defaultValues,
  cancelHref,
  friends = [],
  pendingFriends = [],
}: ClubFormProps & { friends?: FriendUser[] }) {
  const router = useRouter();
  const store = useClubStore();

  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const form = useForm<ClubSchemaData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      privacy: defaultValues?.privacy ?? 'PUBLIC',
      explorable: defaultValues?.explorable ?? false,
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
  const explorableValue = watch('explorable');


  const onSubmit = async (data: ClubSchemaData) => {
    setError('');
    const payload = { ...data, tags };

    if (mode === 'create') {
      const result = await store.createClub(payload, invitedIds);
      if (result.success && result.clubId) {
        router.push(`/clubs/${result.clubId}`);
      } else {
        setError(result.message);
      }
    } else {
      const result = await store.updateClub(clubId!, payload);
      if (result.success) {
        // Send any new invites selected on the settings form
        for (const friendId of invitedIds) {
          await store.inviteToClub(clubId!, friendId);
        }
        router.push(`/clubs/${clubId}`);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="club-name" className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Club Name <span className="text-red-400" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          {...register('name')}
          id="club-name"
          aria-required="true"
          aria-describedby={errors.name ? 'club-name-error' : undefined}
          placeholder="e.g. Midnight Mystery Readers…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.name && (
          <p id="club-name-error" role="alert" className="text-xs text-red-400 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="club-description" className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Description{' '}
          <span className="text-white/80 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          id="club-description"
          rows={3}
          placeholder="What is this club about? What kinds of books do you read?"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
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
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc }) => (
            <label key={value} className="relative cursor-pointer h-full">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div className="h-full flex flex-col p-3 rounded-xl border border-[#2a2a2a] bg-[#252525] peer-checked:border-[#FFC300]/50 peer-checked:bg-[#FFC300]/8 transition-all">
                <span className="text-xs font-semibold text-white peer-checked:text-[#FFC300]">
                  {label}
                </span>
                <span className="text-xs text-white/80 mt-0.5 leading-tight">
                  {desc}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-400 mt-1">{errors.privacy.message}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl bg-[#252525] border border-[#2a2a2a] p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Compass className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-medium text-yellow-500 mainFont">Explorable</span>
          </div>
          <p className="text-sm text-white/80">
            List this club on the Explore page so all users can discover it.
            Enabling this will make the club public.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={explorableValue}
          aria-label="Make this club explorable"
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
            aria-hidden="true"
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              explorableValue ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div>
        <label htmlFor="club-rules" className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Club Rules{' '}
          <span className="text-white/80 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('rules')}
          id="club-rules"
          rows={4}
          placeholder="Any rules or guidelines for members? e.g. Be respectful, finish the book before posting spoilers…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.rules && (
          <p className="text-xs text-red-400 mt-1">{errors.rules.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
          Tags <span className="text-white/80 font-normal">(up to 10)</span>
        </label>
        <TagInput
          value={tags}
          onChange={(next) => { setTags(next); setValue('tags', next); }}
          emptyMessage="No tags yet — tags help others find your club."
          error={errors.tags?.message}
        />
      </div>

      {(friends.length > 0 || pendingFriends.length > 0) && (
        <FriendInvitePicker
          friends={friends}
          pendingFriends={pendingFriends}
          selectedIds={invitedIds}
          onChange={setInvitedIds}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === 'edit' ? (
          <DeleteDialog
            itemType="club"
            onDelete={async () => {
              const result = await store.deleteClub(clubId!);
              if (!result.success) throw new Error(result.message);
              router.push('/clubs');
            }}
          />
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
