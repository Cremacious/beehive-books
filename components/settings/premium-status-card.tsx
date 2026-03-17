'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumStatusCardProps {
  premium: boolean;
  stripeCurrentPeriodEnd: Date | null;
}

export function PremiumStatusCard({
  premium,
  stripeCurrentPeriodEnd,
}: PremiumStatusCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }

  const renewalDate = stripeCurrentPeriodEnd
    ? new Intl.DateTimeFormat(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(stripeCurrentPeriodEnd))
    : null;

  if (premium) {
    return (
      <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/25 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFC300]/10 flex items-center justify-center shrink-0">
              <Crown className="w-4.5 h-4.5 text-[#FFC300]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">Premium</p>
                <span className="text-[10px] font-semibold text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2 py-0.5">
                  Active
                </span>
              </div>
              {renewalDate ? (
                <p className="text-xs text-white/80 mt-0.5">
                  Renews {renewalDate}
                </p>
              ) : (
                <p className="text-xs text-white/80 mt-0.5">
                  Subscription active
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManage}
            disabled={loading}
            className="shrink-0 text-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {loading ? 'Loading…' : 'Manage'}
          </Button>
        </div>

        <ul className="mt-4 space-y-1.5">
          {[
            'Unlimited books in your library',
            'Unlimited editing hives',
            'Unlimited book clubs',
            'Unlimited reading lists',
          ].map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2 text-xs text-white/90"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC300]/70 shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className=" font-semibold text-white">Free Plan</p>
              <span className="text-[10px] font-semibold text-white/90 bg-white/5 rounded-full px-2 py-0.5">
                Current
              </span>
            </div>
            <p className="text-sm text-white/80 mt-0.5">
              $2/month to unlock everything
            </p>
          </div>
        </div>

        <Button size="sm" asChild className="shrink-0 text-xs">
          <Link href="/premium">
            Upgrade
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <ul className="mt-4 space-y-1.5">
        {[
          'Unlimited books in your library',
          'Unlimited editing hives',
          'Unlimited book clubs',
          'Unlimited prompts',
          'Unlimited reading lists',
        ].map((limit) => (
          <li
            key={limit}
            className="flex items-center gap-2 text-sm text-white/80"
          >
            <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              —
            </span>
            {limit}
          </li>
        ))}
      </ul>
    </div>
  );
}
