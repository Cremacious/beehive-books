'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import HiveSidebar from './hive-sidebar';
import type { HiveWithMembership, HiveUser } from '@/lib/types/hive.types';

interface HiveMobileMenuButtonProps {
  hiveId: string;
  isOwner: boolean;
  hive: HiveWithMembership;
  topMembers: HiveUser[];
}

export default function HiveMobileMenuButton({
  hiveId,
  isOwner,
  hive,
  topMembers,
}: HiveMobileMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors border border-[#414040]"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium text-white">Hive Menu</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Sliding drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <span className="text-xs font-semibold text-white uppercase tracking-[0.15em]">
                Navigation
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <HiveSidebar
                hiveId={hiveId}
                isOwner={isOwner}
                hive={hive}
                topMembers={topMembers}
                onNavClick={() => setOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
