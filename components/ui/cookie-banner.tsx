'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#1e1e1e] border-t border-[#2a2a2a] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-white/80 text-center sm:text-left">
        We use cookies for authentication and preferences.{' '}
        <Link href="/cookies" className="text-yellow-500 hover:text-white transition-colors">
          Learn more
        </Link>
        .
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 px-4 py-1.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
      >
        Got it
      </button>
    </div>
  );
}
