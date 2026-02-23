import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a]">
      <DesktopSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNavbar />
    </div>
  );
}
