import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminMobileNav from '@/components/admin/admin-mobile-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
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
