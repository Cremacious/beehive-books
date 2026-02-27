import Link from 'next/link';
import { Globe, Users, Lock, BookMarked, BookOpen } from 'lucide-react';
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
    list.bookCount > 0
      ? Math.round((list.readCount / list.bookCount) * 100)
      : 0;
  const remaining = list.bookCount - list.readCount;

  return (
    <Link
      href={`/reading-lists/${list.id}`}
      className="group flex flex-col rounded-xl bg-[#202020] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookMarked className="w-5 h-5 text-[#FFC300]/80 shrink-0" />
          <h3 className="text-base font-semibold text-white truncate group-hover:text-[#FFC300] transition-colors">
            {list.title}
          </h3>
        </div>
        <div className="p-2 rounded-full bg-[#2a2a2a] shrink-0">
          <PrivacyIcon className="w-5 h-5 text-yellow-500" />
        </div>
      </div>

      {list.description && (
        <p className="text-sm text-white/80 line-clamp-2 mb-3 leading-relaxed">
          {list.description}
        </p>
      )}

      {list.currentlyReadingTitle && (
        <div className="mb-3 px-2.5 py-2 rounded-lg bg-[#FFC300]/6 border border-[#FFC300]/15">
          <div className="flex items-center gap-1.5 mb-0.5">
            <BookOpen className="w-3 h-3 text-[#FFC300]/80 shrink-0" />
            <span className="text-xs font-semibold text-[#FFC300] uppercase tracking-wider">
              Now Reading
            </span>
          </div>
          <p className="text-sm text-white truncate font-medium">
            {list.currentlyReadingTitle}
          </p>
          {list.currentlyReadingAuthor && (
            <p className="text-xs text-white/80 truncate">
              {list.currentlyReadingAuthor}
            </p>
          )}
        </div>
      )}

      {list.bookCount > 0 ? (
        <div className="mb-3">
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFC300] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs text-white/80">
            <span>{list.readCount} read</span>
            <span>{pct}%</span>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <div className="h-1.5 bg-[#1a1a1a] rounded-full" />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between text-xs text-white/80">
        <span>
          {list.bookCount} book{list.bookCount !== 1 ? 's' : ''}
          {remaining > 0 && <> · {remaining} left</>}
        </span>
        <span>{timeAgo(list.updatedAt)}</span>
      </div>
    </Link>
  );
}
