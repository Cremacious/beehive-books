'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, signUp } from '@/lib/auth-client';
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import logoImage from '@/public/logo3.png';

function getStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0;
  const hasMin = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasMin) return 1;
  if (hasMin && (hasUpper && hasNumber)) return 3;
  return 2;
}

function validatePassword(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('at least one uppercase letter (A–Z)');
  if (!/[0-9]/.test(password)) issues.push('at least one number (0–9)');
  return issues;
}

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getStrength(password);
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-green-500'];
  const strengthColor = strengthColors[strength];

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: 'google', callbackURL: '/home' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const issues = validatePassword(password);
    if (issues.length > 0) {
      setError(`Password must include: ${issues.join(', ')}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const result = await signUp.email({ name: email.split('@')[0], email, password });

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

    setVerificationEmail(email);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.01]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30l26 15z' fill='%23FFC300'/%3E%3C/svg%3E")`,
        backgroundSize: '56px 100px',
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,195,0,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_110%,rgba(255,195,0,0.06),transparent)]" />
      <div className="relative w-full max-w-md">
        <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8">
          <Image src={logoImage} alt="Beehive Books" width={160} height={54} className="mx-auto mb-4" priority />
          {verificationEmail ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1 mainFont">Check your inbox</h1>
              <div className="mt-4 rounded-xl bg-[#FFC300]/10 border border-[#FFC300]/20 px-4 py-4 text-sm text-[#FFC300]">
                We sent a verification email to <span className="font-semibold">{verificationEmail}</span>. Click the link to activate your account.
              </div>
              <p className="mt-5 text-center text-sm text-white/70">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-[#FFC300] hover:text-[#FFD040] font-medium">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
          <>
          <h1 className="text-xl font-bold text-white mb-1 mainFont text-center">Create an account</h1>
          <p className="text-sm text-white/70 mb-6 text-center ">Join the Beehive Books community!</p>

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
              <span className="bg-[#1c1c1c] px-2 text-white/70">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                Email
              </label>
              <input
                type="email"
                data-testid="sign-up-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 pr-11 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength >= seg ? strengthColor : 'bg-[#2a2a2a]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-1.5 mainFont">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-3 pr-11 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPassword.length > 0 && (
                    password === confirmPassword
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              data-testid="sign-up-submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FFC300] py-3 text-sm font-bold text-black transition-all duration-100 hover:bg-[#FFD040] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="mt-5 text-center text-sm text-white/70">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#FFC300] hover:text-[#FFD040] font-medium">
              Sign in
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
