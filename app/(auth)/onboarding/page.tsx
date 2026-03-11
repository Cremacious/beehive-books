'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import {
  completeOnboarding,
  checkUsernameAvailableAction,
} from '@/lib/actions/auth.actions';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useCloudinaryUpload(
    'avatars',
    user?.id ?? 'onboarding',
  );

  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const isBusy = isPending || uploading;
  const canSubmit = availability === 'available' && !isBusy;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const trimmed = username.trim();

      if (!trimmed) {
        setAvailability('idle');
        setAvailabilityMsg('');
        return;
      }

      setAvailability('checking');
      setAvailabilityMsg('');

      const result = await checkUsernameAvailableAction(trimmed);
      if (result.error) {
        setAvailability('invalid');
        setAvailabilityMsg(result.error);
      } else if (result.available) {
        setAvailability('available');
        setAvailabilityMsg('Username is available');
      } else {
        setAvailability('taken');
        setAvailabilityMsg('Username is already taken');
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      setSubmitError('');

      let imageUrl: string | undefined;
      if (selectedFile) {
        const url = await upload(selectedFile);
        if (!url) {
          setSubmitError('Failed to upload profile picture. Please try again.');
          return;
        }
        imageUrl = url;
      }

      const result = await completeOnboarding(username.trim(), imageUrl);
      if (result.error) {
        setSubmitError(result.error);
        if (result.error.includes('username')) {
          setAvailability('taken');
          setAvailabilityMsg(result.error);
        }
        return;
      }

      await user?.reload();
      router.push('/feed');
    });
  }

  const indicatorColor: Record<Availability, string> = {
    idle: '',
    checking: 'text-white/40',
    available: 'text-green-400',
    taken: 'text-red-400',
    invalid: 'text-red-400',
  };

  const borderColor: Record<Availability, string> = {
    idle: 'border-[#333]',
    checking: 'border-[#333]',
    available: 'border-green-500/50',
    taken: 'border-red-500/50',
    invalid: 'border-red-500/50',
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1e1e1e] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#252525] p-8 shadow-lg border border-[#2a2a2a]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white mainFont">
            Beehive<span className="text-[#FFC300]">Books</span>
          </h1>
          <p className="mt-1 text-sm text-[#FFC300]">Set up your profile</p>
        </div>

        {isLoaded && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-28 w-28 rounded-full overflow-hidden bg-[#2a2a2a] border-2 border-[#FFC300]/25 hover:border-[#FFC300]/60 transition-colors focus:outline-none"
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera className="h-8 w-8 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <span className="text-xs text-white/80">
                {previewUrl
                  ? 'Tap to change photo'
                  : 'Add a profile photo (optional)'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-yellow-500 mainFont">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. KikiTheCat"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={20}
                  required
                  className={`w-full rounded-xl bg-[#2a2a2a] border px-4 py-3 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors ${borderColor[availability]}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {availability === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  )}
                  {availability === 'available' && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                  {(availability === 'taken' || availability === 'invalid') && (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>

              {availabilityMsg && (
                <p className={`text-xs ${indicatorColor[availability]}`}>
                  {availabilityMsg}
                </p>
              )}
              {availability === 'idle' && (
                <p className="text-xs text-white/80">
                  3–20 characters. Letters, numbers, and underscores only.
                </p>
              )}
            </div>

            {submitError && (
              <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-medium text-black transition-colors hover:bg-[#FFC300]/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading photo…
                </span>
              ) : isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
