'use client';

import { useState } from 'react';
import { Star, Flame } from 'lucide-react';

type Tab = 'new' | 'popular';

export function ExploreCommunityDiscoveryPanel<T extends { id: string }>({
  newItems,
  popularItems,
  renderItem,
  newLabel = 'New',
  popularLabel = 'Popular',
}: {
  newItems: T[];
  popularItems: T[];
  renderItem: (item: T) => React.ReactNode;
  newLabel?: string;
  popularLabel?: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('popular');

  if (!newItems.length && !popularItems.length) return null;

  const items = activeTab === 'new' ? newItems : popularItems;

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-center gap-1 mb-4">
        {([
          { id: 'popular' as Tab, label: popularLabel, Icon: Flame, color: 'text-orange-400' },
          { id: 'new' as Tab, label: newLabel, Icon: Star, color: 'text-[#FFC300]' },
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
          {items.map((item) => renderItem(item))}
        </div>
      ) : (
        <p className="text-xs text-white/40 py-4 text-center">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
