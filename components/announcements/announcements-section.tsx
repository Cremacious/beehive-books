'use client';

import { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { dismissAnnouncementAction } from '@/lib/actions/admin.actions';
import type { AnnouncementItem } from '@/lib/actions/admin.actions';

export function AnnouncementsSection({ announcements }: { announcements: AnnouncementItem[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  async function handleDismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
    await dismissAnnouncementAction(id);
  }

  return (
    <div className="space-y-3">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#FFC300]/5 border border-[#FFC300]/20"
        >
          <Bell className="w-4 h-4 text-[#FFC300] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{a.title}</p>
            <p className="text-sm text-white/70 mt-0.5 leading-relaxed">{a.content}</p>
          </div>
          <button
            onClick={() => handleDismiss(a.id)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
