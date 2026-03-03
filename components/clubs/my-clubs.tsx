import Link from 'next/link';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClubCard from './club-card';
import type { ClubWithMembership } from '@/lib/types/club.types';

export default function MyClubs({ clubs }: { clubs: ClubWithMembership[] }) {
  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#252525] flex items-center justify-center mb-5">
          <Users className="w-9 h-9 text-white/80" />
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-2 mainFont">
          You haven&apos;t joined any clubs yet
        </h2>
        <p className="text-sm text-white/80 mb-6 max-w-xs">
          Create your own book club or discover existing ones to join.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/clubs/create">
              <Plus />
              Create a Club
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clubs/find">
              <Search />
              Find Clubs
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
          <h2 className="text-lg font-semibold text-white mainFont">My Clubs</h2>
          <p className="text-sm text-white/80 mt-0.5">
            {clubs.length} club{clubs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/clubs/create">
            <Plus />
            Create Club
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  );
}
