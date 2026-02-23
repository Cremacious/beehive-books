import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DesktopSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-2 md:p-3">
        <div className="w-full min-h-full bg-[#1e1e1e] rounded-2xl">
          {children}
        </div>
      </main>
      <MobileNavbar />
    </div>
  );
}
