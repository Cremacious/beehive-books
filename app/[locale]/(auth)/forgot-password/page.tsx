'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import logoImage from '@/public/logo3.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Always show success regardless of whether the email exists (security best practice)
    await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,195,0,0.07),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image src={logoImage} alt="Beehive Books" width={220} height={74} priority />
        </Link>

        <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1 mainFont">Reset your password</h1>
          <p className="text-sm text-white/80 mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#FFC300]/10 border border-[#FFC300]/20 px-4 py-4">
                <p className="text-sm text-[#FFC300] font-medium mb-1">Check your inbox</p>
                <p className="text-sm text-white/70">
                  If an account exists for <span className="text-white">{email}</span>, you&apos;ll
                  receive a password reset link shortly.
                </p>
              </div>
              <Link
                href="/sign-in"
                className="block text-center text-sm text-white/50 hover:text-[#FFC300] transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-bold text-black transition-colors hover:bg-[#FFD040] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>

              <p className="text-center text-sm text-white/50">
                <Link href="/sign-in" className="hover:text-[#FFC300] transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
