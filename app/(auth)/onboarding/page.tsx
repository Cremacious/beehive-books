'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/lib/actions/auth.actions';
import { Camera } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/home');
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
          <p className="mt-1 text-sm text-zinc-500">Add a profile photo to personalize your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
  
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                <Camera className="h-4 w-4" />
                <input type="file" name="avatar" accept="image/*" className="hidden" />
              </label>
            </div>
            <span className="text-xs text-zinc-400">Profile photo (optional)</span>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isPending ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
