import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminMobileNav from '@/components/admin/admin-mobile-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: { role: true },
  });

  if (user?.role !== 'admin') redirect('/');

  return (
    <div className="flex h-full min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AdminMobileNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
