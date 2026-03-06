'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface ExploreSearchBarProps {
  placeholder?: string;
}

export function ExploreSearchBar({ placeholder = 'Search...' }: ExploreSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();

  const submit = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set('q', q.trim());
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clear = () => {
    setValue('');
    submit('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className="relative w-full"
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value === '') submit('');
        }}
        placeholder={placeholder}
        className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-[#FFC300]/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
