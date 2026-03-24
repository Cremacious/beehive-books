'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Lock, UserCheck } from 'lucide-react';
import BookCard from '@/components/library/book-card';
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import ClubCard from '@/components/clubs/club-card';
import HiveCard from '@/components/hive/hive-card';
import { PromptCard } from '@/components/prompts/prompt-card';
import { ProfileSectionGrid } from '@/components/profile/profile-section-grid';
import type { Book } from '@/lib/types/books.types';
import type { ReadingList } from '@/lib/types/reading-list.types';
import type { ClubWithMembership } from '@/lib/types/club.types';
import type { HiveWithMembership } from '@/lib/types/hive.types';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';

interface ProfileContentProps {
  books: (Book & { likeCount?: number })[];
  readingLists: ReadingList[];
  clubs: ClubWithMembership[];
  hives: HiveWithMembership[];
  promptCards: PromptCardType[];
  isOwnProfile: boolean;
}

function PrivacyBadge({ privacy }: { privacy: 'PRIVATE' | 'FRIENDS' }) {
  const isPrivate = privacy === 'PRIVATE';
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-white/80">
      {isPrivate ? (
        <Lock className="w-2.5 h-2.5" />
      ) : (
        <UserCheck className="w-2.5 h-2.5" />
      )}
      <span className="text-[10px] leading-none">
        {isPrivate ? 'Private' : 'Friends'}
      </span>
    </span>
  );
}

export function ProfileContent({
  books,
  readingLists,
  clubs,
  hives,
  promptCards,
  isOwnProfile,
}: ProfileContentProps) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();

  const filteredBooks = useMemo(
    () => q ? books.filter((b) => `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(q)) : books,
    [books, q],
  );
  const filteredLists = useMemo(
    () => q ? readingLists.filter((l) => `${l.title} ${l.description ?? ''}`.toLowerCase().includes(q)) : readingLists,
    [readingLists, q],
  );
  const filteredClubs = useMemo(
    () => q ? clubs.filter((c) => `${c.name} ${c.description ?? ''}`.toLowerCase().includes(q)) : clubs,
    [clubs, q],
  );
  const filteredHives = useMemo(
    () => q ? hives.filter((h) => `${h.name} ${h.description ?? ''}`.toLowerCase().includes(q)) : hives,
    [hives, q],
  );
  const filteredPrompts = useMemo(
    () => q ? promptCards.filter((p) => `${p.title} ${p.description ?? ''}`.toLowerCase().includes(q)) : promptCards,
    [promptCards, q],
  );

  const hasResults =
    filteredBooks.length + filteredLists.length + filteredClubs.length +
    filteredHives.length + filteredPrompts.length > 0;

  return (
    <>
      {/* Universal search */}
      <div className="relative mb-8 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this profile..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      {q && !hasResults && (
        <div className="py-16 text-center">
          <p className="text-sm text-white/50">No results for &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery('')}
            className="text-xs text-[#FFC300]/60 hover:text-[#FFC300] mt-2 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {filteredBooks.length > 0 && (
        <ProfileSectionGrid
          title="Library"
          count={filteredBooks.length}
          limit={8}
          gridClassName="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          layout="scroll"
        >
          {filteredBooks.map((book) => (
            <div key={book.id} className="relative">
              <BookCard book={book} basePath={isOwnProfile ? '/library' : '/books'} />
              {isOwnProfile && book.privacy !== 'PUBLIC' && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <PrivacyBadge privacy={book.privacy as 'PRIVATE' | 'FRIENDS'} />
                </div>
              )}
            </div>
          ))}
        </ProfileSectionGrid>
      )}

      {filteredHives.length > 0 && (
        <ProfileSectionGrid
          title="Hives"
          count={filteredHives.length}
          limit={3}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          statusValues={filteredHives.map((h) => h.status)}
          statusLabels={{ ACTIVE: 'Active', COMPLETED: 'Completed' }}
        >
          {filteredHives.map((hive) => (
            <HiveCard key={hive.id} hive={hive} />
          ))}
        </ProfileSectionGrid>
      )}

      {filteredClubs.length > 0 && (
        <ProfileSectionGrid
          title="Book Clubs"
          count={filteredClubs.length}
          limit={3}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </ProfileSectionGrid>
      )}

      {filteredPrompts.length > 0 && (
        <ProfileSectionGrid
          title="Prompts"
          count={filteredPrompts.length}
          limit={3}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          statusValues={filteredPrompts.map((p) => p.status)}
          statusLabels={{ ACTIVE: 'Active', ENDED: 'Ended' }}
        >
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </ProfileSectionGrid>
      )}

      {filteredLists.length > 0 && (
        <ProfileSectionGrid
          title="Reading Lists"
          count={filteredLists.length}
          limit={3}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredLists.map((list) => (
            <ReadingListCard key={list.id} list={list} />
          ))}
        </ProfileSectionGrid>
      )}
    </>
  );
}
