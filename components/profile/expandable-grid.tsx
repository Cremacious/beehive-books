'use client';

import React, { useState } from 'react';
import type { ReactNode } from 'react';

export function ExpandableGrid({
  children,
  count,
  limit = 5,
  className,
  placeholder,
}: {
  children: ReactNode;
  count: number;
  limit?: number;
  className: string;
  placeholder?: ReactNode;
}) {
  const [showAll, setShowAll] = useState(false);
  const all = React.Children.toArray(children);

  let visible: ReactNode[];
  if (showAll) {
    visible = all;
  } else {
    const realSlice = all.slice(0, limit);
    visible = [...realSlice];
    if (placeholder) {
      const needed = Math.max(0, limit - realSlice.length);
      for (let i = 0; i < needed; i++) {
        visible.push(
          <React.Fragment key={`__ph_${i}`}>{placeholder}</React.Fragment>,
        );
      }
    }
  }

  return (
    <>
      <div className={className}>{visible}</div>
      {count > limit && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAll((p) => !p)}
            className="text-sm text-white/80 hover:text-[#FFC300] border border-[#2a2a2a] hover:border-[#FFC300]/30 rounded-lg px-4 py-2 transition-all"
          >
            {showAll ? 'Show less' : `View all (${count})`}
          </button>
        </div>
      )}
    </>
  );
}
