import { auth } from '@clerk/nextjs/server';
import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';
import { syncUser } from '@/sync-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {

  const { sessionClaims } = await auth();
  const meta = sessionClaims?.metadata as { onboardingComplete?: boolean; username?: string } | undefined;
  if (!meta?.onboardingComplete || !meta?.username) {
    await syncUser();
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <DesktopSidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-3 pb-16 md:pb-3 px-2 md:px-3 mt-2 md:mt-0">
        <div className="w-full min-h-full bg-[#1e1e1e] rounded-2xl">
          {children}
        </div>
      </main>
      <MobileNavbar />
    </div>
  );
}
