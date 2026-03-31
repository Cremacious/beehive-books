import Image from 'next/image';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { MILESTONES } from '@/lib/milestones';
import type { HiveMilestoneEntry } from '@/lib/actions/hive.actions';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function MemberAvatar({ image, username }: { image: string | null; username: string | null }) {
  const fallback = (username ?? '?')[0].toUpperCase();
  if (image) {
    return (
      <Image
        src={image}
        alt={username ?? 'user'}
        width={20}
        height={20}
        className="w-5 h-5 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[10px] font-bold text-yellow-500 shrink-0">
      {fallback}
    </div>
  );
}

export function HiveMilestones({ achieved }: { achieved: HiveMilestoneEntry[] }) {
  const achievedKeys = new Set(achieved.map((m) => m.key));
  const achievedMap = new Map(achieved.map((m) => [m.key, m]));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Milestones</h2>
        {achieved.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#FFC300] text-black">
            {achieved.length}
          </span>
        )}
      </div>

      {achieved.length === 0 && (
        <div className="py-8 text-center">
          <Trophy className="w-8 h-8 text-white/80 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No milestones yet</p>
          <p className="text-xs text-white/80">Keep writing — achievements will appear here.</p>
        </div>
      )}

      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#2a2a2a]" />

        <div className="space-y-4">
          {MILESTONES.map((m) => {
            const done = achievedKeys.has(m.key);
            const entry = achievedMap.get(m.key);
            return (
              <div key={m.key} className="flex gap-4 items-start relative">
                {/* dot */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                    done
                      ? 'bg-[#FFC300] border-[#FFC300]'
                      : 'bg-[#1a1a1a] border-[#2a2a2a]'
                  }`}
                >
                  {done && <CheckCircle2 className="w-3 h-3 text-black" />}
                </div>

                {/* content */}
                <div
                  className={`flex-1 pb-1 ${
                    done ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${
                        done ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {m.label}
                    </span>
                    {done && entry && (
                      <span className="text-xs text-white/80">{timeAgo(entry.achievedAt)}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">{m.description}</p>
                  {done && entry && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MemberAvatar image={entry.member.image} username={entry.member.username} />
                      <span className="text-xs text-white/80">{entry.member.username ?? 'Unknown'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
