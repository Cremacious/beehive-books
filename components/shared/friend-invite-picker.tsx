'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Clock, Search, Users } from 'lucide-react';
import type { FriendUser } from '@/lib/actions/friend.actions';

interface FriendInvitePickerProps {
  friends: FriendUser[];
  pendingFriends?: FriendUser[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function FriendInvitePicker({
  friends,
  pendingFriends = [],
  selectedIds,
  onChange,
}: FriendInvitePickerProps) {
  const [search, setSearch] = useState('');

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  const q = search.toLowerCase();
  const filtered = friends.filter((f) => !search || f.username?.toLowerCase().includes(q));
  const filteredPending = pendingFriends.filter((f) => !search || f.username?.toLowerCase().includes(q));
  const hasAny = friends.length > 0 || pendingFriends.length > 0;

  return (
    <div>
      <label className="block text-sm font-medium text-yellow-500 mainFont mb-1.5">
        <Users className="inline w-3.5 h-3.5 mr-1 text-yellow-500" aria-hidden="true" />
        Invite Friends{' '}
        <span className="text-white/80 font-normal">(optional)</span>
        {selectedIds.length > 0 && (
          <span className="ml-2 text-xs text-[#FFC300] font-normal">
            {selectedIds.length} selected
          </span>
        )}
        {pendingFriends.length > 0 && (
          <span className="ml-2 text-xs text-amber-400/80 font-normal">
            {pendingFriends.length} pending
          </span>
        )}
      </label>

      {!hasAny ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] px-4 py-4">
          <p className="text-sm text-white/80 text-center">
            No friends to invite yet.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#2a2a2a]">
            <Search className="w-3.5 h-3.5 text-white/80 shrink-0" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends…"
              aria-label="Search friends to invite"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto" role="list">
            {filtered.length === 0 && filteredPending.length === 0 ? (
              <li className="px-4 py-3 text-sm text-white/80">No matches</li>
            ) : (
              <>
                {filtered.map((f) => {
                  const selected = selectedIds.includes(f.id);
                  const name = f.username ?? 'Unknown';
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => toggle(f.id)}
                        aria-pressed={selected}
                        aria-label={`${selected ? 'Remove' : 'Invite'} ${name}`}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selected ? 'bg-[#FFC300]/8' : 'hover:bg-white/4'
                        }`}
                      >
                        {f.image ? (
                          <Image
                            src={f.image}
                            alt={name}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 ring-2 ring-[#FFC300]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#FFC300] text-[10px] font-bold">
                              {name[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                        )}
                        <span className="flex-1 text-sm text-white truncate">
                          {name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            selected ? 'bg-[#FFC300] border-[#FFC300]' : 'border-white/20'
                          }`}
                          aria-hidden="true"
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                      </button>
                    </li>
                  );
                })}

                {filteredPending.map((f) => {
                  const name = f.username ?? 'Unknown';
                  return (
                    <li key={f.id} className="opacity-60">
                      <div className="w-full flex items-center gap-3 px-4 py-2.5">
                        {f.image ? (
                          <Image
                            src={f.image}
                            alt={name}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 ring-2 ring-[#FFC300]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#FFC300] text-[10px] font-bold">
                              {name[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                        )}
                        <span className="flex-1 text-sm text-white truncate">{name}</span>
                        <span className="flex items-center gap-1 text-xs text-amber-400/80 shrink-0">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      </div>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
