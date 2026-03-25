'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { sendFriendRequestAction } from '@/lib/actions/friend.actions';
import type { SuggestedUser } from '@/lib/actions/friend.actions';

function SuggestedCard({ user }: { user: SuggestedUser }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const name = user.username ?? 'Unknown';
  const initials = name.charAt(0).toUpperCase();

  const handleAdd = async () => {
    if (sent || loading || !user.id) return;
    setLoading(true);
    const result = await sendFriendRequestAction(user.id);
    setLoading(false);
    if (result.success) setSent(true);
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-3 w-44 shrink-0 flex flex-col items-center gap-2 text-center">
      <Link href={`/u/${name}`} className="shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center hover:opacity-80 transition-opacity">
            <span className="text-base font-bold text-yellow-500">{initials}</span>
          </div>
        )}
      </Link>

      <div className="min-w-0 w-full">
        <Link
          href={`/u/${name}`}
          className="text-sm font-semibold text-white hover:text-yellow-500 transition-colors truncate block"
        >
          {name}
        </Link>
        {user.mutualContext && (
          <p className="text-xs text-white/80 mt-0.5 truncate">{user.mutualContext}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={sent || loading}
        className="w-full bg-[#FFC300] text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#FFD040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : sent ? (
          'Request sent'
        ) : (
          'Add Friend'
        )}
      </button>
    </div>
  );
}

interface WritersYouMightKnowProps {
  suggestions: SuggestedUser[];
}

export default function WritersYouMightKnow({ suggestions }: WritersYouMightKnowProps) {
  if (suggestions.length === 0) return null;

  return (
    <section>
      <p className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-3">
        Writers you might know
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8">
        {suggestions.map((user) => (
          <SuggestedCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
}
