'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className="w-12 h-12 rounded-full bg-[#FFC300]/10 border border-[#FFC300]/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#FFC300]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-white mainFont">Something went wrong</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            An unexpected error occurred. You can try again or head back home.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 rounded-full bg-[#FFC300] py-2.5 text-sm font-bold text-black hover:bg-[#FFD040] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/home"
            className="flex-1 rounded-full border border-[#2a2a2a] py-2.5 text-sm font-medium text-white/70 hover:text-white hover:border-[#444] transition-colors text-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
