import { getAllNotificationsAdminAction } from '@/lib/actions/admin.actions';
import NotificationsTable from '@/components/admin/notifications-table';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAllNotificationsAdminAction(page);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-widest mb-1">
          System
        </p>
        <h1 className="text-2xl font-bold text-white">All Notifications</h1>
      </div>
      <NotificationsTable {...data} />
    </div>
  );
}
