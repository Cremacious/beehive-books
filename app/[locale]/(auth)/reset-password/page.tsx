'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import logoImage from '@/public/logo3.png';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setLoading(true);

    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError(result.error.message ?? 'Failed to reset password. The link may have expired.');
      setLoading(false);
      return;
    }

    router.push('/sign-in?reset=success');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-bold text-black transition-colors hover:bg-[#FFD040] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting…
          </span>
        ) : (
          'Reset password'
        )}
      </button>

      <p className="text-center text-sm text-white/50">
        <Link href="/sign-in" className="hover:text-[#FFC300] transition-colors">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,195,0,0.07),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image src={logoImage} alt="Beehive Books" width={220} height={74} priority />
        </Link>

        <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1 mainFont">Set a new password</h1>
          <p className="text-sm text-white/80 mb-6">
            Choose a strong password with at least 8 characters.
          </p>

          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
