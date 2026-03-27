'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  defaultValue?: string;
  autoFocus?: boolean;
}

export function SearchInput({ defaultValue = '', autoFocus = false }: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const clear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className="relative w-full"
    >
      {isPending ? (
        <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFC300] animate-spin pointer-events-none" />
      ) : (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search books, clubs, hives, prompts..."
        className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl pl-12 pr-12 py-4 text-base text-white placeholder:text-white/80 focus:outline-none focus:border-[#FFC300]/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </form>
  );
}
