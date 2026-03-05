import Link from 'next/link';
import { Globe, Users, Lock, BookOpen } from 'lucide-react';
import type { ReadingList } from '@/lib/types/reading-list.types';

const PRIVACY_ICONS = {
  PUBLIC: Globe,
  FRIENDS: Users,
  PRIVATE: Lock,
} as const;

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ReadingListCard({ list }: { list: ReadingList }) {
  const PrivacyIcon = PRIVACY_ICONS[list.privacy];
  const pct =
    list.bookCount > 0 ? Math.round((list.readCount / list.bookCount) * 100) : 0;
  const remaining = list.bookCount - list.readCount;

  return (
    <Link
      href={`/reading-lists/${list.id}`}
      className="group flex flex-col rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#34d399]/30 hover:bg-[#222222] transition-all duration-200"
    >
      <div className="h-0.75 w-full bg-[#34d399]" />

      <div className="flex flex-col flex-1 gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-white leading-snug truncate group-hover:text-[#34d399] transition-colors mainFont">
            {list.title}
          </h3>
          <PrivacyIcon className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
        </div>

        {list.description && (
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
            {list.description}
          </p>
        )}

        {list.currentlyReadingTitle && (
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-[#34d399]/6 border border-[#34d399]/12">
            <BookOpen className="w-3.5 h-3.5 text-[#34d399]/70 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#34d399] uppercase tracking-wider mb-0.5">
                Now Reading
              </p>
              <p className="text-sm text-white truncate">{list.currentlyReadingTitle}</p>
              {list.currentlyReadingAuthor && (
                <p className="text-xs text-white/80 truncate">{list.currentlyReadingAuthor}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5 text-xs text-white/80">
            <span>
              {list.readCount} of {list.bookCount} read
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-[#252525] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#34d399] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a] text-xs text-white/80">
          <span>
            {list.bookCount} book{list.bookCount !== 1 ? 's' : ''}
            {remaining > 0 && <> · {remaining} left</>}
          </span>
          <span>{timeAgo(list.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
