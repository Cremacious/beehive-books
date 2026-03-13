'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MILESTONE_INFO } from '@/lib/types/hive.types';
import type {
  MilestoneWithUser,
  HiveRole,
  MilestoneType,
} from '@/lib/types/hive.types';

interface HiveMilestonesProps {
  initialMilestones: MilestoneWithUser[];
  currentUserId: string;
  myRole: HiveRole;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type Tab = 'grid' | 'feed';

export default function HiveMilestones({
  initialMilestones,
  currentUserId,
}: HiveMilestonesProps) {
  const milestones = initialMilestones;
  const [tab, setTab] = useState<Tab>('grid');
  const [filter, setFilter] = useState<MilestoneType | null>(null);

  const byType: Partial<Record<MilestoneType, MilestoneWithUser[]>> = {};
  for (const m of milestones) {
    if (!byType[m.type]) byType[m.type] = [];
    byType[m.type]!.push(m);
  }

  const allTypes = Object.keys(MILESTONE_INFO) as MilestoneType[];
  const recent = [...milestones].sort(
    (a, b) =>
      new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
  );

  const unlockedCount = allTypes.filter(
    (t) => (byType[t]?.length ?? 0) > 0,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2 text-center">
          <p className="text-xl font-bold text-[#FFC300]">{unlockedCount}</p>
          <p className="text-xs text-white">/ {allTypes.length} unlocked</p>
        </div>
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2 text-center">
          <p className="text-xl font-bold text-white">{milestones.length}</p>
          <p className="text-xs text-white">total earned</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#1e1e1e] w-fit">
        {(['grid', 'feed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t
                ? 'bg-[#FFC300] text-black'
                : 'text-white/80 hover:text-white/60'
            }`}
          >
            {t === 'grid' ? 'All Milestones' : 'Recent Unlocks'}
          </button>
        ))}
      </div>

      {tab === 'grid' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allTypes.map((type) => {
              const info = MILESTONE_INFO[type];
              const earners = byType[type] ?? [];
              const unlocked = earners.length > 0;
              const isMine = earners.some((e) => e.userId === currentUserId);
              const isSelected = filter === type;

              return (
                <button
                  key={type}
                  onClick={() => setFilter(isSelected ? null : type)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    unlocked
                      ? isMine
                        ? 'bg-[#FFC300]/10 border-[#FFC300]/30 hover:border-[#FFC300]/50'
                        : 'bg-[#252525] border-[#2a2a2a] hover:border-[#3a3a3a]'
                      : 'bg-[#1a1a1a] border-[#222] opacity-40 cursor-default'
                  } ${isSelected ? 'ring-1 ring-[#FFC300]/50' : ''}`}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <p
                    className={`text-xs font-semibold ${
                      unlocked ? 'text-white' : 'text-white/30'
                    }`}
                  >
                    {info.label}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5 leading-snug line-clamp-2">
                    {info.description}
                  </p>
                  {unlocked && (
                    <div className="flex -space-x-1 mt-2 items-center">
                      {earners
                        .slice(0, 5)
                        .map((e) =>
                          e.user.image ? (
                            <Image
                              key={e.id}
                              src={e.user.image}
                              alt=""
                              width={16}
                              height={16}
                              className="rounded-full ring-1 ring-[#1e1e1e]"
                            />
                          ) : (
                            <div
                              key={e.id}
                              className="w-4 h-4 rounded-full bg-[#FFC300]/30 ring-1 ring-[#1e1e1e]"
                            />
                          ),
                        )}
                      {earners.length > 5 && (
                        <span className="text-xs text-white/30 pl-2">
                          +{earners.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filter && (
            <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{MILESTONE_INFO[filter].icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {MILESTONE_INFO[filter].label}
                  </p>
                  <p className="text-xs text-white/40">
                    {MILESTONE_INFO[filter].description}
                  </p>
                </div>
              </div>
              {(byType[filter] ?? []).length === 0 ? (
                <p className="text-sm text-white/30 italic">
                  No one has earned this yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {(byType[filter] ?? []).map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      {m.user.image ? (
                        <Image
                          src={m.user.image}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#FFC300]/20" />
                      )}
                      <span className="flex-1 text-sm text-white/70">
                        {m.user.username ?? 'User'}
                      </span>
                      <span className="text-xs text-white/30">
                        {formatDate(m.unlockedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'feed' && (
        <div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center gap-3">
              <div className="text-4xl">🐣</div>
              <p className=" text-white/80">
                No milestones unlocked yet.
              </p>
              <p className="text-sm text-white/80 max-w-xs">
                Milestones are earned by writing, completing chapters, and
                participating in sprints.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((m) => {
                const info = MILESTONE_INFO[m.type];
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl bg-[#252525] border border-[#2a2a2a] p-3"
                  >
                    <span className="text-xl shrink-0">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {info.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {m.user.image && (
                          <Image
                            src={m.user.image}
                            alt=""
                            width={14}
                            height={14}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-xs text-white/40">
                          {m.user.username ?? 'User'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-white/25 shrink-0">
                      {formatDate(m.unlockedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
