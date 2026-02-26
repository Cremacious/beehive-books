'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Users, FileText, Clock, Trophy } from 'lucide-react';
import type { PromptCard as PromptCardType, PromptUser } from '@/lib/types/prompt.types';

function formatCountdown(endDate: Date): string {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0)  return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function UserAvatar({ user, size = 6 }: { user: PromptUser; size?: number }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '?';
  const cls  = `w-${size} h-${size} rounded-full shrink-0 overflow-hidden bg-[#2a2000] flex items-center justify-center`;
  return (
    <div className={cls}>
      {user.imageUrl ? (
        <Image src={user.imageUrl} alt={name} width={24} height={24} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-[#FFC300]">{(name[0] || '?').toUpperCase()}</span>
      )}
    </div>
  );
}

export function PromptCard({ prompt }: { prompt: PromptCardType }) {
  const isEnded  = prompt.status === 'ENDED' || prompt.endDate < new Date();
  const [countdown, setCountdown] = useState(() => isEnded ? 'Ended' : formatCountdown(prompt.endDate));

  useEffect(() => {
    if (isEnded) return;
    const id = setInterval(() => setCountdown(formatCountdown(prompt.endDate)), 60_000);
    return () => clearInterval(id);
  }, [isEnded, prompt.endDate]);

  const creatorName =
    [prompt.creator.firstName, prompt.creator.lastName].filter(Boolean).join(' ') ||
    prompt.creator.username ||
    'Unknown';

  return (
    <Link
      href={`/prompts/${prompt.id}`}
      className="group flex flex-col rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200 overflow-hidden"
    >
      {/* Accent bar */}
      <div className={`h-1 w-full ${isEnded ? 'bg-white/10' : 'bg-[#FFC300]'}`} />

      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Status + visibility badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isEnded
              ? 'bg-white/10 text-white/70'
              : 'bg-[#FFC300]/10 text-[#FFC300]'
          }`}>
            {isEnded ? 'Ended' : 'Active'}
          </span>
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
            {prompt.isPublic ? 'Public' : 'Private'}
          </span>
          {prompt.myInviteStatus && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/70">
              {prompt.myInviteStatus === 'PENDING' ? 'Invited' : 'Joined'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#FFC300] transition-colors">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed flex-1">
          {prompt.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] mt-auto">
          <div className="flex items-center gap-1.5">
            <UserAvatar user={prompt.creator} size={5} />
            <span className="text-xs text-white/70 truncate max-w-[80px]">{creatorName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-white/70">
              <FileText className="w-3 h-3" />
              {prompt.entryCount}
            </span>
            <span className={`flex items-center gap-1 text-xs ${isEnded ? 'text-white/70' : 'text-[#FFC300]/70'}`}>
              {isEnded ? <Trophy className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
