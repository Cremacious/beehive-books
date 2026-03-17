'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Plus, X, Loader2, Users, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { useClubStore } from '@/lib/stores/club-store';
import { clubSchema } from '@/lib/validations/club.schema';
import type { ClubSchemaData } from '@/lib/validations/club.schema';
import type { ClubFormProps, InvitableClubFriend } from '@/lib/types/club.types';

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
}: ClubFormProps & { friends?: InvitableClubFriend[] }) {
  const router = useRouter();
  const store = useClubStore();

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  function toggleInvite(id: string) {
    setInvitedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id],
    );
  }

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
      const result = await store.createClub(payload, invitedIds);
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
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
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
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_OPTIONS.map(({ value, label, desc }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('privacy')}
                type="radio"
                value={value}
                className="sr-only peer"
              />
              <div className="flex flex-col p-3 rounded-xl border border-[#2a2a2a] bg-[#252525] peer-checked:border-[#FFC300]/50 peer-checked:bg-[#FFC300]/8 transition-all">
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
            <label htmlFor="tag-input" className="sr-only">Add a tag</label>
            <input
              id="tag-input"
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
              aria-label="Add tag"
              className="px-3 py-2 rounded-lg bg-[#FFC300]/15 text-[#FFC300] hover:bg-[#FFC300]/25 disabled:opacity-30 transition-colors shrink-0"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-white bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag: ${tag}`}
                    className="text-white/80 hover:text-red-400 transition-colors"
                  >
                    <X aria-hidden="true" className="w-3 h-3" />
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

      {mode === 'create' && privacy === 'PRIVATE' && (
        <div>
          <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
            <Users className="inline w-3.5 h-3.5 mr-1 text-yellow-500" />
            Invite Friends{' '}
            <span className="text-white/80 font-normal">(optional)</span>
            {invitedIds.length > 0 && (
              <span className="ml-2 text-xs text-[#FFC300] font-normal">
                {invitedIds.length} selected
              </span>
            )}
          </label>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3">
            {friends.length === 0 ? (
              <p className="text-sm text-white/80 text-center py-3">
                No friends to invite yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {friends.map((f) => {
                  const selected = invitedIds.includes(f.id);
                  const name = f.username ?? 'Unknown';
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleInvite(f.id)}
                      aria-pressed={selected}
                      aria-label={`${selected ? 'Remove' : 'Invite'} ${name}`}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                        selected ? 'bg-[#FFC300]/8' : 'hover:bg-white/4'
                      }`}
                    >
                      {f.image ? (
                        <Image
                          src={f.image}
                          alt={name}
                          width={28}
                          height={28}
                          className="rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0">
                          <span className="text-[#FFC300] text-xs font-bold">
                            {name[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="flex-1 text-sm text-white truncate">{name}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          selected ? 'bg-[#FFC300] border-[#FFC300]' : 'border-white/20'
                        }`}
                      >
                        {selected && <Check className="w-2.5 h-2.5 text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
