import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { X, Sparkles, Crown, Heart } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  UpgradeButton,
  ManageSubscriptionButton,
} from '@/components/premium/premium-button';

export const metadata: Metadata = {
  title: 'Premium',
  description:
    'Upgrade to Beehive Premium and unlock the full writing experience.',
};

const btnClass =
  'w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFC300] text-black font-bold text-base hover:bg-[#FFD040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

export default async function PremiumPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  let isPremium = false;
  let hasStripeSubscription = false;

  if (session?.user?.id) {
    const [dbUser] = await db
      .select({
        premium: users.premium,
        stripeSubscriptionId: users.stripeSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    isPremium = dbUser?.premium === true;
    hasStripeSubscription = !!dbUser?.stripeSubscriptionId;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">
      {/* Solo dev emotional appeal — always shown */}
      {/* <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
    
            <p className="text-sm text-white/80 leading-relaxed">
              Hello, my name is Chris, and I am the solo developer who built Beehive Books. There are no investors, no corporate backing, and no team. Just me, a lot of coffee, and a genuine love for storytelling. Premium keeps the servers running, keeps ads off the site, funds new features, and makes sure this platform stays alive and growing. If Beehive has ever helped you write, share, or connect with other writers, upgrading to Premium is the most direct way to say thank you.
            </p>
          </div>
        </div>
      </div> */}

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mainFont mb-3 leading-tight">
          Write without limits
        </h1>
        <p className="text-white/80 max-w-lg mx-auto text-base leading-relaxed">
          Unlock the full Beehive experience for less than a cup of coffee a
          month.
        </p>
      </div>

      {/* Solo dev emotional appeal — always shown */}
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-white/80 leading-relaxed">
              Hello, my name is Chris, and I am the solo developer who built
              Beehive Books. There are no investors and
              no team. Just me, a lot of coffee, and a genuine love for
              storytelling. Premium keeps the servers running, keeps ads off the
              site, funds new features, and makes sure this platform stays alive
              and growing. If Beehive Books has ever helped you write, share, or
              connect with other writers, upgrading to Premium is the most
              direct way to say thank you.
            </p>
          </div>
        </div>
      </div>
      {/* Pricing / Status Card */}
      {isPremium && !hasStripeSubscription ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#252525] p-8 mb-10 text-center">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">
            You have Premium access
          </p>
          <p className="text-sm text-white/80">
            Your account has complimentary premium access. All features are
            unlocked.
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-[#FFC300]/30 bg-[#FFC300]/5 p-8 mb-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-[#FFC300]/5 to-transparent pointer-events-none" />
          <div className="relative">
            {isPremium ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC300]/20 border border-[#FFC300]/40 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC300]" />
                  <span className="text-sm font-bold text-[#FFC300]">
                    Active Subscription
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-7">
                  You are on Premium. Manage or cancel anytime below.
                </p>
                <ManageSubscriptionButton className={btnClass} />
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#FFC300] uppercase tracking-widest mb-3">
                  Monthly
                </p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-bold text-white mainFont">
                    $2
                  </span>
                  <span className="text-white/80 mb-2 text-base">/ month</span>
                </div>
                <p className="text-white/80 text-sm mb-7">
                  Cancel anytime. No commitments.
                </p>
                <UpgradeButton className={btnClass} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mainFont mb-5">
          Free vs Premium
        </h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
          <div className="grid grid-cols-3 border-b border-[#2a2a2a]">
            <div className="px-5 py-3.5">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Feature
              </span>
            </div>
            <div className="px-5 py-3.5 text-center border-l border-[#2a2a2a]">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Free
              </span>
            </div>
            <div className="px-5 py-3.5 text-center border-l border-[#FFC300]/20 bg-[#FFC300]/5">
              <span className="text-xs font-bold text-[#FFC300] uppercase tracking-widest">
                Premium
              </span>
            </div>
          </div>
          {[
            { label: 'Books', free: '2 books', premium: 'Unlimited' },
            {
              label: 'Word limit per book',
              free: '50,000 words',
              premium: 'Unlimited',
            },
            { label: 'Writing Hives', free: '1 hive', premium: 'Unlimited' },
            { label: 'Book Clubs', free: '1 club', premium: 'Unlimited' },
            {
              label: 'Sparks (Writing Challenges)',
              free: '1 active',
              premium: 'Unlimited',
            },
            { label: 'Reading Lists', free: '1 list', premium: 'Unlimited' },
            { label: 'File export (DOCX, PDF, EPUB)', free: 'Not Included', premium: 'Included' },
     
          
          ].map(({ label, free, premium }, i, arr) => (
            <div
              key={label}
              className={`grid grid-cols-3 ${i < arr.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
            >
              <div className="px-5 py-3">
                <span className="text-sm text-white">{label}</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#2a2a2a]">
                {free ? (
                  <span className="text-sm text-white/80">{free}</span>
                ) : (
                  <X className="w-4 h-4 text-white/80" />
                )}
              </div>
              <div className="px-5 py-3 flex items-center justify-center border-l border-[#FFC300]/20 bg-[#FFC300]/5">
                <span className="text-sm text-yellow-500 font-medium">
                  {premium}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA — only for non-premium */}
      {!isPremium && (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#252525] p-7 text-center">
          <p className="text-base font-bold text-white mainFont mb-1">
            Ready to upgrade?
          </p>
          <p className="text-sm text-white/80 mb-5">
            Two dollars a month keeps Beehive alive and your writing unlimited.
          </p>
          <UpgradeButton className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#FFC300] text-black font-bold text-sm hover:bg-[#FFD040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed" />
        </div>
      )}
    </div>
  );
}
