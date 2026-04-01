'use client';

import { useState } from 'react';
import { Star, Flame } from 'lucide-react';
import ClubCard from '@/components/clubs/club-card';
import HiveCard from '@/components/hive/hive-card';
import { PromptCard } from '@/components/prompts/prompt-card';
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import type { ClubWithMembership } from '@/lib/types/club.types';
import type { HiveWithMembership } from '@/lib/types/hive.types';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';
import type { ReadingList } from '@/lib/types/reading-list.types';

type Tab = 'new' | 'popular';

type PanelProps =
  | { kind: 'clubs'; newItems: ClubWithMembership[]; popularItems: ClubWithMembership[]; popularLabel?: string }
  | { kind: 'hives'; newItems: HiveWithMembership[]; popularItems: HiveWithMembership[]; popularLabel?: string }
  | { kind: 'sparks'; newItems: PromptCardType[]; popularItems: PromptCardType[]; popularLabel?: string }
  | { kind: 'lists'; newItems: ReadingList[]; popularItems: ReadingList[]; popularLabel?: string };

function renderItem(kind: PanelProps['kind'], item: ClubWithMembership | HiveWithMembership | PromptCardType | ReadingList) {
  if (kind === 'clubs') return <ClubCard key={item.id} club={item as ClubWithMembership} />;
  if (kind === 'hives') return <HiveCard key={item.id} hive={item as HiveWithMembership} />;
  if (kind === 'sparks') return <PromptCard key={item.id} prompt={item as PromptCardType} />;
  return <ReadingListCard key={item.id} list={item as ReadingList} />;
}

export function ExploreCommunityDiscoveryPanel(props: PanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('popular');

  const { newItems, popularItems, popularLabel = 'Popular' } = props;

  if (!newItems.length && !popularItems.length) return null;

  const items = activeTab === 'new' ? newItems : popularItems;

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-center gap-1 mb-4">
        {([
          { id: 'popular' as Tab, label: popularLabel, Icon: Flame, color: 'text-orange-400' },
          { id: 'new' as Tab, label: 'New', Icon: Star, color: 'text-[#FFC300]' },
        ]).map(({ id, label, Icon, color }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#252525] border border-[#3a3a3a] text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? color : ''}`} />
              {label}
            </button>
          );
        })}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => renderItem(props.kind, item))}
        </div>
      ) : (
        <p className="text-xs text-white/40 py-4 text-center">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
