'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Check, Loader2 } from 'lucide-react';
import logoImage from '@/public/logo3.png';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import {
  checkUsernameAction,
  completeOnboardingAction,
} from '@/lib/actions/onboarding.actions';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isActive = n === current;
        const isPast = n < current;
        return (
          <span
            key={n}
            className={`rounded-full transition-all duration-300 ${
              isActive
                ? 'w-6 h-2 bg-[#FFC300]'
                : isPast
                  ? 'w-2 h-2 bg-[#FFC300]/40'
                  : 'w-2 h-2 bg-[#2a2a2a]'
            }`}
          />
        );
      })}
    </div>
  );
}

export function OnboardingFlow({
  existingUsername,
  userId,
}: {
  existingUsername: string | null;
  userId: string;
}) {
  const initialStep = existingUsername ? 2 : 1;
  const [step, setStep] = useState<1 | 2 | 3>(initialStep as 1 | 2 | 3);

  // Step 1
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2
  const [bio, setBio] = useState('');

  // Step 3 — photo
  const { upload, uploading } = useCloudinaryUpload('avatars', userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleUsernameChange(value: string) {
    setUsername(value);
    setUsernameAvailable(null);
    setUsernameError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value) return;
    if (!/^[a-zA-Z0-9_]{1,20}$/.test(value)) {
      setUsernameError('Letters, numbers, and underscores only.');
      return;
    }
    if (value.length < 3) return;

    setUsernameChecking(true);
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAction(value);
      setUsernameChecking(false);
      if (result.error) {
        setUsernameError(result.error);
        setUsernameAvailable(false);
      } else {
        setUsernameAvailable(result.available);
        if (!result.available) setUsernameError('That username is already taken.');
      }
    }, 400);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadError('');
    const url = await upload(file);
    if (!url) {
      setUploadError('Upload failed. Please try again.');
    } else {
      setUploadedUrl(url);
    }
  }

  async function handleFinish(skipPhoto = false) {
    setSubmitting(true);
    setSubmitError('');

    const result = await completeOnboardingAction({
      username: existingUsername ? undefined : username,
      bio,
      imageUrl: skipPhoto ? undefined : (uploadedUrl ?? undefined),
    });

    if (!result.success) {
      setSubmitting(false);
      setSubmitError(result.error ?? 'Something went wrong. Please try again.');
      if (result.error?.toLowerCase().includes('username')) {
        setStep(1);
        setUsernameAvailable(false);
        setUsernameError(result.error ?? '');
      }
      return;
    }

    window.location.href = '/home';
  }

  const step1Valid =
    username.length >= 3 &&
    !usernameError &&
    !usernameChecking &&
    usernameAvailable === true;

  const initial = (existingUsername ?? username)[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Honeycomb background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30l26 15z' fill='%23FFC300'/%3E%3C/svg%3E")`,
          backgroundSize: '56px 100px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,195,0,0.10),transparent)]" />

      <div className="relative w-full max-w-lg flex flex-col items-center gap-6">
        {/* Logo */}
        <Image src={logoImage} alt="Beehive Books" width={160} height={54} priority />

        {/* Card */}
        <div className="w-full rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] shadow-2xl p-8">
          <StepDots current={step} total={3} />

          {/* ── Step 1: Username ─────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-white mainFont text-center mb-1">
                Welcome to Beehive Books
              </h1>
              <p className="text-sm text-white/80 text-center mb-8">
                Let&apos;s get your profile set up.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white mainFont">
                  Choose a username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    maxLength={20}
                    placeholder="your_username"
                    autoFocus
                    className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking && (
                      <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>
                <div className="min-h-5">
                  {usernameError ? (
                    <p className="text-xs text-red-400">{usernameError}</p>
                  ) : usernameAvailable === true ? (
                    <p className="text-xs text-green-400">Username is available.</p>
                  ) : (
                    <p className="text-xs text-white/40">
                      3–20 characters. Letters, numbers, and underscores.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="mt-6 w-full py-3 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
              >
                Next
              </button>
            </div>
          )}

          {/* ── Step 2: Bio ──────────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-white mainFont text-center mb-1">
                Tell writers about yourself
              </h1>
              <p className="text-sm text-white/80 text-center mb-8">
                A short bio helps others get to know you. You can always update it later.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white mainFont">
                  Bio <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="I write sci-fi thrillers and love reading fantasy..."
                  className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                />
                <p className="text-xs text-white/40 text-right">{bio.length}/200</p>
              </div>

              <button
                onClick={() => setStep(3)}
                className="mt-4 w-full py-3 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] active:scale-95 transition-all duration-100"
              >
                Next
              </button>
              <button
                onClick={() => { setBio(''); setStep(3); }}
                className="mt-3 w-full py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {/* ── Step 3: Profile photo ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-white mainFont text-center mb-1">
                Add a profile photo
              </h1>
              <p className="text-sm text-white/80 text-center mb-8">
                Help other writers recognize you.
              </p>

              {/* Avatar preview */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="group relative w-24 h-24 rounded-full overflow-hidden bg-[#2a2000] border-2 border-[#FFC300]/20 hover:border-[#FFC300]/50 transition-colors focus:outline-none disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#2a2000]">
                      <Loader2 className="w-6 h-6 text-[#FFC300] animate-spin" />
                    </div>
                  ) : uploadedUrl ? (
                    <>
                      <Image
                        src={uploadedUrl}
                        alt="Profile photo"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#FFC300]">{initial}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? 'Uploading...'
                    : uploadedUrl
                      ? 'Change photo'
                      : 'Choose a photo'}
                </button>

                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}
              </div>

              {submitError && (
                <p className="mb-4 rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                  {submitError}
                </p>
              )}

              <button
                onClick={() => handleFinish(false)}
                disabled={submitting || uploading}
                className="w-full py-3 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up your account...
                  </span>
                ) : (
                  'Finish'
                )}
              </button>
              <button
                onClick={() => handleFinish(true)}
                disabled={submitting || uploading}
                className="mt-3 w-full py-2 text-sm text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
