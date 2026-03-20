'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function ExploreLoadMoreButton({ nextCursor }: { nextCursor: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cursor', nextCursor);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleLoadMore}
        disabled={isPending}
        className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#1e1e1e] px-6 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </>
        ) : (
          'Load more'
        )}
      </button>
    </div>
  );
}
