'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { PromptEntry, PromptUser } from '@/lib/types/prompt.types';
import { Button } from '../ui/button';

function UserAvatar({ user }: { user: PromptUser }) {
  const name = user.username || '?';
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={name}
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-[#FFC300]">
          {(name[0] || '?').toUpperCase()}
        </span>
      )}
    </div>
  );
}

function displayName(user: PromptUser): string {
  return user.username || 'Anonymous';
}

interface Props {
  entries: PromptEntry[];
  promptId: string;
  currentUserId: string | null;
}

export function EntryList({ entries, promptId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
        <p className="text-sm text-white/80">
          No entries yet — be the first to write!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        return (
          <div
            key={entry.id}
            className="flex items-start gap-4 p-4 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/20 transition-all"
          >
            <UserAvatar user={entry.user} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className=" font-semibold text-white">
                  {displayName(entry.user)}
                </span>
                {entry.user.username && (
                  <span className="text-sm text-white/80"></span>
                )}

                <Button asChild size={'sm'}>
                  <Link
                    href={`/prompts/${promptId}/${entry.id}`}
                    className="text-sm ml-auto"
                  >
                    Read entry →
                  </Link>
                </Button>
              </div>

              <p
                className="text-sm text-white/80 line-clamp-3 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{
                  __html: entry.content.replace(/<[^>]*>/g, ' ').slice(0, 200),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
