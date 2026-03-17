'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WikiEntryWithAuthor, HiveRole } from '@/lib/types/hive.types';

interface HiveCharacterMapProps {
  hiveId: string;
  characters: WikiEntryWithAuthor[];
  myRole: HiveRole;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

const TAG_COLORS = [
  'bg-[#FFC300]/15 text-[#FFC300]/80',
  'bg-blue-500/15 text-blue-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-purple-500/15 text-purple-400',
  'bg-orange-500/15 text-orange-400',
  'bg-pink-500/15 text-pink-400',
];

function CharacterCard({
  character,
  hiveId,
  onSelect,
  isSelected,
}: {
  character: WikiEntryWithAuthor;
  hiveId: string;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
}) {
  const preview = stripHtml(character.content);
  const initials = character.title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#FFC300]/10 border-[#FFC300]/40'
          : 'bg-[#252525] border-[#2a2a2a] hover:border-[#2a2a2a]'
      }`}
      onClick={() => onSelect(isSelected ? null : character.id)}
    >
      <div className="p-4">
        <div className="w-10 h-10 rounded-xl bg-[#FFC300]/20 flex items-center justify-center mb-3 text-sm font-bold text-[#FFC300]">
          {initials}
        </div>

        <h3 className="text-sm font-semibold text-white mb-1">
          {character.title}
        </h3>

        {preview && (
          <p className="text-xs text-white/80 leading-relaxed line-clamp-3 mb-3">
            {preview}
          </p>
        )}

        {character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.tags.slice(0, 4).map((tag, i) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  TAG_COLORS[i % TAG_COLORS.length]
                }`}
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 4 && (
              <span className="text-xs text-white/80">
                +{character.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {isSelected && (
        <div className="border-t border-[#FFC300]/20 px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-white/80">
            Added{' '}
            {new Date(character.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <Link
            href={`/hive/${hiveId}/wiki`}
            className="flex items-center gap-1 text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <BookOpen className="w-3 h-3" />
            View in Wiki
          </Link>
        </div>
      )}
    </div>
  );
}

export default function HiveCharacterMap({
  hiveId,
  characters,
}: HiveCharacterMapProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = characters.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#252525] flex items-center justify-center">
          <Users className="w-7 h-7 text-[#FFC300]/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">
            No characters yet
          </p>
          <p className="text-xs text-white/80 max-w-xs">
            Add characters from the wiki by selecting the{' '}
            <span className="text-[#FFC300]/70">Character</span> category. Use
            tags to indicate relationships (e.g. &ldquo;sister:aria&rdquo;,
            &ldquo;enemy&rdquo;).
          </p>
        </div>
        <Link href={`/hive/${hiveId}/wiki`}>
          <Button size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5" />
            Add Character
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/80 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters or tags…"
            className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] pl-9 pr-9 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Link href={`/hive/${hiveId}/wiki`}>
          <Button size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </Link>
      </div>

      <p className="text-xs text-white/80">
        {filtered.length} character{filtered.length !== 1 ? 's' : ''}
        {search ? ` matching "${search}"` : ''} · click to expand
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-white/80 text-center py-12">
          No characters match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              hiveId={hiveId}
              onSelect={setSelectedId}
              isSelected={selectedId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
