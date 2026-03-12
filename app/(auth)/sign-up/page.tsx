'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import logoImage from '@/public/logo3.png';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signUp.email({ name, email, password });

    if (result.error) {
      const msg = result.error.message ?? '';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('use another email')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
      setLoading(false);
      return;
    }

    // Full page navigation so the session cookie is sent with the new request
    window.location.href = '/onboarding';
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,195,0,0.07),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image src={logoImage} alt="Beehive Books" width={220} height={74} priority />
        </Link>

        <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1 mainFont">Create account</h1>
          <p className="text-sm text-white/50 mb-6">Join the Beehive Books community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-xl bg-[#252525] border border-[#333] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
              />
            </div>

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
                className="w-full rounded-xl bg-[#252525] border border-[#333] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                className="w-full rounded-xl bg-[#252525] border border-[#333] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-bold text-black transition-colors hover:bg-[#FFD040] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#FFC300] hover:text-[#FFD040] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
