'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { completeOnboarding } from '@/lib/actions/auth.actions';
import { Camera } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1e1e1e] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#252525] p-8 shadow-lg border border-[#2a2a2a]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white mainFont">
            Beehive<span className="text-[#FFC300]">Books</span>
          </h1>
          <p className="mt-1 text-sm text-yellow-500">
            Set up your profile
          </p>
        </div>

        {isLoaded && (
          <form onSubmit={handleSubmit} className="space-y-6">
      
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-[#2a2a2a] border-2 border-[#FFC300]/25" />
                <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#FFC300] text-black shadow-md transition-colors hover:bg-[#FFC300]/80">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-sm text-yellow-500">
                Profile picture (optional)
              </span>
            </div>

        
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/80">
                Username
              </label>
              <input
                type="text"
                name="username"
                defaultValue={user?.username ?? ''}
                placeholder="e.g. KikiTheCat"
                autoComplete="off"
                spellCheck={false}
                required
                className="w-full rounded-xl bg-[#2a2a2a] border border-[#333] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
              />
              <p className="text-sm text-white/90">
                This is how other readers will find you. You can use any capitalization.
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-medium text-black transition-colors hover:bg-[#FFC300]/80 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
