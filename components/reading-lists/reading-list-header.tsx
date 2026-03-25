import Link from 'next/link';
import { Edit, Globe, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {
  ReadingListHeaderProps,
} from '@/lib/types/reading-list.types';

const PRIVACY_CONFIG = {
  PUBLIC: { icon: Globe, label: 'Public' },
  FRIENDS: { icon: Users, label: 'Friends' },
  PRIVATE: { icon: Lock, label: 'Private' },
} as const;

export function ReadingListHeader({ list, isOwner }: ReadingListHeaderProps) {
  const { icon: PrivacyIcon, label: privacyLabel } =
    PRIVACY_CONFIG[list.privacy];

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-[#FFC300] leading-tight mb-2 mainFont">
            {list.title}
          </h1>
          <div className="flex items-center gap-1.5 mb-3">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <PrivacyIcon className="w-3 h-3" />
              {privacyLabel}
            </Badge>
          </div>
          {list.description && (
            <p className="text-sm text-white/80 leading-relaxed">
              {list.description}
            </p>
          )}
          {list.currentlyReadingTitle && (
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider shrink-0">Now Reading</span>
              <span className="text-sm font-semibold text-white">{list.currentlyReadingTitle}</span>
              {list.currentlyReadingAuthor && (
                <span className="text-sm text-white/80">by {list.currentlyReadingAuthor}</span>
              )}
            </div>
          )}
        </div>

        {isOwner && (
          <Button variant="outline" asChild size="sm" className="shrink-0">
            <Link href={`/reading-lists/${list.id}/edit`}>
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
