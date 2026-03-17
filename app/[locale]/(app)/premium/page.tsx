import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Check, X, Sparkles, BookOpen, Users2, Hexagon, PenLine, Zap, Star } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UpgradeButton, ManageSubscriptionButton } from '@/components/premium/premium-button';

export const metadata: Metadata = {
  title: 'Premium',
  description: 'Upgrade to Beehive Premium and unlock the full writing experience.',
};

const FREE_FEATURES = [
  { label: 'Create up to 3 books', included: true },
  { label: 'Join up to 3 book clubs', included: true },
  { label: 'Participate in writing prompts', included: true },
  { label: 'Basic reading lists', included: true },
  { label: 'Unlimited books & chapters', included: false },
  { label: 'Unlimited book clubs', included: false },
  { label: 'Create & join unlimited hives', included: false },
  { label: 'Premium profile badge', included: false },
  { label: 'Priority support', included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Unlimited books & chapters' },
  { label: 'Unlimited book clubs' },
  { label: 'Create & join unlimited hives' },
  { label: 'Participate in writing prompts' },
  { label: 'Unlimited reading lists' },
  { label: 'Premium profile badge' },
  { label: 'Priority support' },
  { label: 'Early access to new features' },
];

const HIGHLIGHTS = [
  { icon: BookOpen, color: 'text-[#FFC300]', bg: 'bg-[#FFC300]/10', title: 'Unlimited Writing', description: 'No caps on books, chapters, or words. Write as much as you want.' },
  { icon: Users2, color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Unlimited Clubs', description: 'Join and create as many book clubs as you like.' },
  { icon: Hexagon, color: 'text-teal-400', bg: 'bg-teal-400/10', title: 'Full Hive Access', description: 'Collaborate on unlimited hives with writers across the community.' },
  { icon: PenLine, color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Writing Prompts', description: 'Participate in all prompts and share your entries with everyone.' },
  { icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10', title: 'Premium Badge', description: 'Stand out on your profile with an exclusive premium badge.' },
  { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'Early Access', description: 'Be the first to try new features before they roll out to everyone.' },
];

const btnClass =
  'w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFC300] text-black font-bold text-base hover:bg-[#FFD040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

export default async function PremiumPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  let isPremium = false;

  if (session?.user?.id) {
    const [dbUser] = await db
      .select({ premium: users.premium })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    isPremium = dbUser?.premium === true;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC300]/10 border border-[#FFC300]/25 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC300]" />
          <span className="text-xs font-bold text-[#FFC300] uppercase tracking-widest">Beehive Premium</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mainFont mb-4 leading-tight">
          Write without limits
        </h1>
        <p className="text-white/80 max-w-lg mx-auto text-base leading-relaxed">
          Unlock the full Beehive experience — unlimited books, clubs, hives, and more.
          Built for writers who are serious about their craft.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="relative rounded-2xl border border-[#FFC300]/30 bg-[#FFC300]/5 p-8 mb-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFC300]/5 to-transparent pointer-events-none" />
        <div className="relative">
          {isPremium ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC300]/20 border border-[#FFC300]/40 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC300]" />
                <span className="text-sm font-bold text-[#FFC300]">Active Subscription</span>
              </div>
              <p className="text-white/80 text-sm mb-7">
                You&apos;re on Premium. Manage or cancel anytime below.
              </p>
              <ManageSubscriptionButton className={btnClass} />
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#FFC300] uppercase tracking-widest mb-3">Monthly</p>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl font-bold text-white mainFont">$2</span>
                <span className="text-white/80 mb-2 text-base">/ month</span>
              </div>
              <p className="text-white/80 text-sm mb-7">Cancel anytime. No commitments.</p>
              <UpgradeButton className={btnClass} />
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-white mainFont mb-5">Everything included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, color, bg, title, description }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-[#252525] border border-[#2a2a2a]">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs text-white/80 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div>
        <h2 className="text-lg font-bold text-white mainFont mb-5">Free vs Premium</h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
          <div className="grid grid-cols-3 border-b border-[#2a2a2a]">
            <div className="px-5 py-3.5">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Feature</span>
            </div>
            <div className="px-5 py-3.5 text-center border-l border-[#2a2a2a]">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Free</span>
            </div>
            <div className="px-5 py-3.5 text-center border-l border-[#FFC300]/20 bg-[#FFC300]/5">
              <span className="text-xs font-bold text-[#FFC300] uppercase tracking-widest">Premium</span>
            </div>
          </div>
          {FREE_FEATURES.map(({ label, included }, i) => (
            <div key={label} className={`grid grid-cols-3 ${i < FREE_FEATURES.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}>
              <div className="px-5 py-3"><span className="text-sm text-white">{label}</span></div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#2a2a2a]">
                {included ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-white/80" />}
              </div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#FFC300]/20 bg-[#FFC300]/5">
                <Check className="w-4 h-4 text-[#FFC300]" />
              </div>
            </div>
          ))}
          {PREMIUM_FEATURES.filter(f => !FREE_FEATURES.find(ff => ff.label === f.label)).map(({ label }) => (
            <div key={label} className="grid grid-cols-3 border-t border-[#2a2a2a]">
              <div className="px-5 py-3"><span className="text-sm text-white">{label}</span></div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#2a2a2a]">
                <X className="w-4 h-4 text-white/80" />
              </div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#FFC300]/20 bg-[#FFC300]/5">
                <Check className="w-4 h-4 text-[#FFC300]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {!isPremium && (
        <div className="mt-10 rounded-2xl border border-[#2a2a2a] bg-[#252525] p-7 text-center">
          <p className="text-base font-bold text-white mainFont mb-1">Ready to upgrade?</p>
          <p className="text-sm text-white/80 mb-5">Join thousands of writers on Beehive Premium.</p>
          <UpgradeButton className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#FFC300] text-black font-bold text-sm hover:bg-[#FFD040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed" />
        </div>
      )}

    </div>
  );
}
