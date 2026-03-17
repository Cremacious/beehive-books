import Link from 'next/link';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function PremiumSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FFC300]/15 flex items-center justify-center mx-auto mb-6 ring-2 ring-[#FFC300]/20">
        <CheckCircle className="w-8 h-8 text-[#FFC300]" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC300]/10 border border-[#FFC300]/25 mb-5">
        <Sparkles className="w-3.5 h-3.5 text-[#FFC300]" />
        <span className="text-xs font-bold text-[#FFC300] uppercase tracking-widest">
          Beehive Premium
        </span>
      </div>
      <h1 className="text-3xl font-bold text-white mainFont mb-3">You&apos;re all set!</h1>
      <p className="text-white/80 mb-8">
        Your premium subscription is active. Enjoy unlimited writing, clubs, hives, and more.
      </p>
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#FFC300] text-black font-bold text-sm hover:bg-[#FFD040] transition-colors"
      >
        Start writing
      </Link>
    </div>
  );
}
