'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import logoImage from '@/public/logo3.png';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: 'google', callbackURL: '/home' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? 'Invalid email or password.');
      setLoading(false);
      return;
    }

    // Full page navigation so the session cookie is sent with the new request
    window.location.href = '/home';
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,195,0,0.07),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image src={logoImage} alt="Beehive Books" width={220} height={74} priority />
        </Link>

        <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1 mainFont">Sign in</h1>
          <p className="text-sm text-white/50 mb-6">Welcome back to Beehive Books</p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1c1c1c] px-2 text-white/30">or</span>
            </div>
          </div>

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
                autoComplete="current-password"
                placeholder="••••••••"
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
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/50">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#FFC300] hover:text-[#FFD040] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
