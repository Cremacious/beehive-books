import { auth } from '@clerk/nextjs/server';
import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';
import { syncUser } from '@/sync-user';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  const meta = sessionClaims?.metadata as { onboardingComplete?: boolean; username?: string } | undefined;
  if (!meta?.onboardingComplete || !meta?.username) {
    await syncUser();
  }

  let isAdmin = false;
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { role: true },
    });
    isAdmin = user?.role === 'admin';
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DesktopSidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-3 pb-16 md:pb-3 px-2 md:px-3 mt-2 md:mt-0">
        <div className="w-full min-h-full bg-[#1e1e1e] rounded-2xl">
          {children}
        </div>
      </main>
      <MobileNavbar isAdmin={isAdmin} />
    </div>
  );
}
