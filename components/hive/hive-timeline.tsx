'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Plus, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WikiEntryWithAuthor, HiveRole } from '@/lib/types/hive.types';

interface HiveTimelineProps {
  hiveId: string;
  entries: WikiEntryWithAuthor[];
  myRole: HiveRole;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TimelineCard({
  entry,
  index,
}: {
  entry: WikiEntryWithAuthor;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = stripHtml(entry.content);
  const isEven = index % 2 === 0;

  return (
    <div className="relative flex items-start gap-4">
      <div className="absolute left-0 top-3 w-3 h-3 rounded-full bg-[#FFC300] ring-4 ring-[#121212] z-10 shrink-0" />

      <div
        className={`ml-7 flex-1 rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 transition-all ${
          expanded ? '' : 'hover:border-[#3a3a3a]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-[#FFC300]/70 bg-[#FFC300]/10 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
            {preview && (
              <p
                className={`text-xs text-white/40 mt-1 leading-relaxed ${
                  expanded ? '' : 'line-clamp-2'
                }`}
              >
                {expanded ? preview : preview}
              </p>
            )}
            {expanded && entry.content && (
              <div
                className="mt-3 prose prose-invert prose-xs max-w-none text-white/60 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {preview.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                {expanded ? 'Less' : 'More'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-white/25">
            {formatDate(entry.createdAt)}
          </span>
          <span className="text-xs text-white/25">
            by {entry.author.username ?? 'User'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HiveTimeline({
  hiveId,
  entries,
  myRole,
}: HiveTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#252525] flex items-center justify-center">
          <Clock className="w-7 h-7 text-[#FFC300]/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/60 mb-1">
            No timeline events yet
          </p>
          <p className="text-xs text-white/30 max-w-xs">
            Add events from the wiki by selecting the{' '}
            <span className="text-[#FFC300]/70">Timeline</span> category. Events
            appear here sorted alphabetically — prefix titles with dates or
            chapter numbers for ordering.
          </p>
        </div>
        <Link href={`/hive/${hiveId}/wiki`}>
          <Button size="sm" variant="outline">
            <BookOpen className="w-3.5 h-3.5" />
            Go to Wiki
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          {entries.length} event{entries.length !== 1 ? 's' : ''} · sorted
          alphabetically
        </p>
        <Link href={`/hive/${hiveId}/wiki`}>
          <Button size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </Button>
        </Link>
      </div>

      <div className="relative pl-1.5">
        <div className="absolute left-1.5 top-3 bottom-3 w-px bg-[#2a2a2a]" />

        <div className="space-y-4">
          {entries.map((entry, i) => (
            <TimelineCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-3 flex items-start gap-2">
        <Clock className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
        <p className="text-xs text-white/30">
          Timeline events are wiki entries with the{' '}
          <span className="text-[#FFC300]/60">Timeline</span> category. Prefix
          titles with dates or chapter numbers (e.g. &quot;Year 1 — The
          Founding&quot;) to control order.
        </p>
      </div>
    </div>
  );
}
