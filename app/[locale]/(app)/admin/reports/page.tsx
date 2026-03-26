import { getContentReportsAction } from '@/lib/actions/admin.actions';
import ReportsTable from '@/components/admin/reports-table';

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

type StatusFilter = 'PENDING' | 'REVIEWED' | 'DISMISSED' | undefined;

export default async function AdminReportsPage({ searchParams }: Props) {
  const { page: pageStr, status } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const validStatus = (status === 'PENDING' || status === 'REVIEWED' || status === 'DISMISSED')
    ? status as StatusFilter
    : undefined;

  const data = await getContentReportsAction(page, 25, validStatus);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Content Reports</h1>
      </div>
      <ReportsTable {...data} statusFilter={validStatus} />
    </div>
  );
}
