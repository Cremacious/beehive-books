'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

interface ExploreGenreChipsProps {
  genres: string[];
}

export function ExploreGenreChips({ genres }: ExploreGenreChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selected = (searchParams.get('genre') ?? '').split(',').filter(Boolean);
  const allActive = selected.length === 0;

  function toggle(genre: string) {
    const params = new URLSearchParams(searchParams.toString());
    const next = selected.includes(genre)
      ? selected.filter((g) => g !== genre)
      : [...selected, genre];

    if (next.length > 0) {
      params.set('genre', next.join(','));
    } else {
      params.delete('genre');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearGenres() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('genre');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={clearGenres}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          allActive
            ? 'bg-[#FFC300] text-black'
            : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 hover:text-white'
        }`}
      >
        All
      </button>

      {genres.map((genre) => {
        const isActive = selected.includes(genre);
        return (
          <button
            key={genre}
            onClick={() => toggle(genre)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#FFC300] text-black'
                : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 hover:text-white'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
