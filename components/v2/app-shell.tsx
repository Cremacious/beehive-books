import { V2DesktopNav } from '@/components/v2/desktop-nav';
import { V2MobileNav } from '@/components/v2/mobile-nav';

type V2AppShellProps = {
  children: React.ReactNode;
  isAdmin?: boolean;
};

export function V2AppShell({ children, isAdmin = false }: V2AppShellProps) {
  return (
    <div data-testid="v2-app-shell" className="fixed inset-0 overflow-hidden bg-[#141414]">
      <div className="flex h-full">
        <V2DesktopNav isAdmin={isAdmin} />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pb-4 pt-16 md:px-4 md:py-4">
          <div className="min-h-full w-full rounded-2xl bg-[#1e1e1e] paper-stack paper-grit">
            {children}
          </div>
        </main>
        <V2MobileNav isAdmin={isAdmin} />
      </div>
    </div>
  );
}
