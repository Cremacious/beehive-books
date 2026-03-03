import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HiveCard from './hive-card';
import type { HiveWithMembership } from '@/lib/types/hive.types';

export default function MyHives({ hives }: { hives: HiveWithMembership[] }) {
  if (hives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#252525] flex items-center justify-center mb-5 text-4xl">
          🐝
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-2 mainFont">
          You haven&apos;t joined any hives yet
        </h2>
        <p className="text-sm text-white/60 mb-6 max-w-xs">
          Create your own hive to collaborate on a book, or explore public hives to join.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/hive/create">
              <Plus />
              Create a Hive
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/hive/explore">
              <Search />
              Explore Hives
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white mainFont">My Hives</h2>
          <p className="text-sm text-white/60 mt-0.5">
            {hives.length} hive{hives.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/hive/create">
            <Plus />
            Create Hive
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hives.map((hive) => (
          <HiveCard key={hive.id} hive={hive} />
        ))}
      </div>
    </div>
  );
}
