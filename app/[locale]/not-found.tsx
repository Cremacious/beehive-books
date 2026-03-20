import { Compass } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] shadow-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className="w-12 h-12 rounded-full bg-[#FFC300]/10 border border-[#FFC300]/20 flex items-center justify-center">
          <Compass className="w-6 h-6 text-[#FFC300]" />
        </div>

        <div className="space-y-1.5">
          <p className="text-4xl font-bold text-[#FFC300] mainFont">404</p>
          <h1 className="text-lg font-bold text-white mainFont">Page not found</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          href="/home"
          className="w-full rounded-full bg-[#FFC300] py-2.5 text-sm font-bold text-black hover:bg-[#FFD040] transition-colors text-center"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
