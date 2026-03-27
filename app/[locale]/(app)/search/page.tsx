import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  searchExplorableBooksAction,
  searchExplorableClubsAction,
  searchExplorableHivesAction,
  searchExplorablePromptsAction,
} from '@/lib/actions/explore.actions';
import { SearchInput } from '@/components/search/search-input';
import BookCard from '@/components/library/book-card';
import ClubCard from '@/components/clubs/club-card';
import HiveCard from '@/components/hive/hive-card';
import PromptCard from '@/components/prompts/prompt-card';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  if (!q.trim()) {
    redirect('/explore');
  }

  const [
    { books },
    { clubs },
    { hives },
    { prompts },
  ] = await Promise.all([
    searchExplorableBooksAction(q, [], [], [], 'newest'),
    searchExplorableClubsAction(q, [], 'most_members'),
    searchExplorableHivesAction(q, [], [], 'most_members'),
    searchExplorablePromptsAction(q),
  ]);

  const bookResults = books.slice(0, 5);
  const clubResults = clubs.slice(0, 5);
  const hiveResults = hives.slice(0, 5);
  const promptResults = prompts.slice(0, 5);

  const totalResults = bookResults.length + clubResults.length + hiveResults.length + promptResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SearchInput autoFocus defaultValue={q} />

      <p className="text-sm text-white/80 mt-3 mb-8">
        Results for &ldquo;<span className="text-white">{q}</span>&rdquo;
      </p>

      {bookResults.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white mainFont">Books</h2>
            <Link
              href={`/explore/books?q=${encodeURIComponent(q)}`}
              className="text-xs text-yellow-500 hover:text-white transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {bookResults.map((b) => (
              <BookCard key={b.id} book={b} basePath="/books" />
            ))}
          </div>
        </section>
      )}

      {clubResults.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white mainFont">Book Clubs</h2>
            <Link
              href={`/explore/clubs?q=${encodeURIComponent(q)}`}
              className="text-xs text-yellow-500 hover:text-white transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clubResults.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>
        </section>
      )}

      {hiveResults.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white mainFont">Writing Hives</h2>
            <Link
              href={`/explore/hives?q=${encodeURIComponent(q)}`}
              className="text-xs text-yellow-500 hover:text-white transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hiveResults.map((h) => (
              <HiveCard key={h.id} hive={h} />
            ))}
          </div>
        </section>
      )}

      {promptResults.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white mainFont">Prompts</h2>
            <Link
              href={`/explore/prompts?q=${encodeURIComponent(q)}`}
              className="text-xs text-yellow-500 hover:text-white transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promptResults.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </section>
      )}

      {totalResults === 0 && (
        <div className="text-center py-20">
          <p className="text-white font-medium">No results for &ldquo;{q}&rdquo;</p>
          <p className="text-sm text-white/80 mt-2">Try different keywords or browse Explore.</p>
        </div>
      )}
    </div>
  );
}
