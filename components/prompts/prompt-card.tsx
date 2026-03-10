'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, Trophy } from 'lucide-react';
import type { PromptCard as PromptCardType, PromptUser } from '@/lib/types/prompt.types';

function formatCountdown(endDate: Date): string {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function UserAvatar({ user, size = 6 }: { user: PromptUser; size?: number }) {
  const name = user.username || '?';
  const cls = `w-${size} h-${size} rounded-full shrink-0 overflow-hidden bg-[#2a0050] flex items-center justify-center`;
  return (
    <div className={cls}>
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={name}
          width={24}
          height={24}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-[#a855f7]">
          {(name[0] || '?').toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function PromptCard({ prompt }: { prompt: PromptCardType }) {
  const router = useRouter();
  const isEnded = prompt.status === 'ENDED' || prompt.endDate < new Date();
  const [countdown, setCountdown] = useState(() =>
    isEnded ? 'Ended' : formatCountdown(prompt.endDate),
  );

  useEffect(() => {
    if (isEnded) return;
    const id = setInterval(() => setCountdown(formatCountdown(prompt.endDate)), 60_000);
    return () => clearInterval(id);
  }, [isEnded, prompt.endDate]);

  const creatorName = prompt.creator.username || 'Unknown';

  return (
    <Link
      href={`/prompts/${prompt.id}`}
      className="group flex flex-col rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#a855f7]/30 hover:bg-[#222222] transition-all duration-200"
    >
      <div className={`h-0.75 w-full ${isEnded ? 'bg-white/15' : 'bg-[#a855f7]'}`} />

      <div className="flex flex-col flex-1 gap-2.5 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isEnded ? 'bg-white/8 text-white/80' : 'bg-[#a855f7]/15 text-[#a855f7]'
            }`}
          >
            {isEnded ? 'Ended' : 'Active'}
          </span>
          <span className="text-xs text-white/80 uppercase tracking-wider">
            {prompt.privacy === 'PUBLIC' ? 'Public' : prompt.privacy === 'FRIENDS' ? 'Friends' : 'Private'}
          </span>
          {prompt.myInviteStatus && (
            <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/80">
              {prompt.myInviteStatus === 'PENDING' ? 'Invited' : 'Joined'}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#a855f7] transition-colors mainFont">
          {prompt.title}
        </h3>

        <p className="text-sm text-white/80 line-clamp-2 leading-relaxed flex-1">
          {prompt.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a] mt-auto text-xs text-white/80">
          {prompt.creator.username ? (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/u/${prompt.creator.username!}`); }}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <UserAvatar user={prompt.creator} size={5} />
              <span className="truncate max-w-20 hover:text-white transition-colors">{creatorName}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <UserAvatar user={prompt.creator} size={5} />
              <span className="truncate max-w-20">{creatorName}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {prompt.entryCount}
            </span>
            <span
              className={`flex items-center gap-1 ${isEnded ? 'text-white/80' : 'text-[#a855f7]'}`}
            >
              {isEnded ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
