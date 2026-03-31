import { getAdminAuditLogAction } from '@/lib/actions/admin.actions';
import AuditLogTable from '@/components/admin/audit-log-table';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAdminAuditLogAction(page);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
      </div>
      <AuditLogTable {...data} />
    </div>
  );
}
