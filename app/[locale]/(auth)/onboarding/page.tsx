'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import logoImage from '@/public/logo3.png';
import {
  completeOnboarding,
  checkUsernameAvailableAction,
} from '@/lib/actions/auth.actions';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const userId = session?.user?.id;

  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useCloudinaryUpload(
    'avatars',
    userId ?? 'onboarding',
  );

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, startTransition] = useTransition();

  const isBusy = isSubmitting || uploading;
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

      window.location.href = '/home';
    });
  }

  const indicatorColor: Record<Availability, string> = {
    idle: '',
    checking: 'text-white/70',
    available: 'text-green-400',
    taken: 'text-red-400',
    invalid: 'text-red-400',
  };

  const borderColor: Record<Availability, string> = {
    idle: 'border-[#2a2a2a]',
    checking: 'border-[#2a2a2a]',
    available: 'border-green-500/50',
    taken: 'border-red-500/50',
    invalid: 'border-red-500/50',
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(255,195,0,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_100%,rgba(255,195,0,0.04),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image src={logoImage} alt="Beehive Books" width={220} height={74} priority />
        </Link>

      <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-1 mainFont">Set up your profile</h1>
        <p className="text-sm text-white/70 mb-6">Choose a username to get started</p>

        {!sessionLoading && (
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
                      <Camera className="h-8 w-8 text-white/70 group-hover:text-white/70 transition-colors" />
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

              <span className="text-xs text-white/70">
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
                  className={`w-full rounded-xl bg-[#252525] border px-4 py-3 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors ${borderColor[availability]}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {availability === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-white/70" />
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
                <p className="text-xs text-white/70">
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
              className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-bold text-black transition-colors hover:bg-[#FFD040] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading photo…
                </span>
              ) : isSubmitting ? (
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
    </div>
  );
}
