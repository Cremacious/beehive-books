import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import logoImage from '@/public/logo3.png';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative">
          <header className="sticky top-0 z-40 h-14 bg-[#1a1a1a] backdrop-blur-md border-b border-[#2a2a2a] flex items-center justify-between px-6">
            <Link href="/" className="flex items-center">
              <Image src={logoImage} alt="Beehive Books" height={32} width={120} priority />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="px-4 py-1.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors">
                Sign up
              </Link>
            </div>
          </header>
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent" />
        </div>
        <main className="flex-1">
          <div className="w-full min-h-full bg-[#1e1e1e]">
            {children}
          </div>
        </main>
      </div>
    );
  }

  const userId = session.user.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true, onboardingComplete: true },
  });

  if (!user?.onboardingComplete) redirect('/onboarding');

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#141414]">
      <div className="flex h-full">
        <DesktopSidebar isAdmin={isAdmin} />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col pt-14 md:pt-3 pb-16 md:pb-3 px-2 md:px-3 mt-2 md:mt-0">
          <div className="flex-1 w-full bg-[#1e1e1e] rounded-2xl animate-in fade-in duration-200">
            {children}
          </div>
        </main>
        <MobileNavbar isAdmin={isAdmin} />
      </div>
    </div>
  );
}
