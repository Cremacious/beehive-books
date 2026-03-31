'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { dismissAnnouncementAction } from '@/lib/actions/admin.actions';
import type { AnnouncementItem, AnnouncementType } from '@/lib/actions/admin.actions';

const TYPE_BADGE: Record<AnnouncementType, { label: string; className: string }> = {
  new_feature: { label: 'New Feature', className: 'bg-[#FFC300]/15 text-yellow-500' },
  coming_soon: { label: 'Coming Soon', className: 'bg-white/10 text-white/80' },
  maintenance: { label: 'Maintenance', className: 'bg-white/10 text-white/80' },
  community_update: { label: 'Update', className: 'bg-white/10 text-white/80' },
};

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
      {visible.map((a) => {
        const badge = TYPE_BADGE[a.type];
        return (
          <div
            key={a.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#FFC300]/5 border border-[#FFC300]/20"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{a.title}</p>
              <p className="text-sm text-white/80 mt-0.5 leading-relaxed">{a.content}</p>
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-yellow-500 underline underline-offset-2 mt-1.5 hover:text-yellow-400 transition-colors"
                >
                  Learn more
                </a>
              )}
            </div>
            <button
              onClick={() => handleDismiss(a.id)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
