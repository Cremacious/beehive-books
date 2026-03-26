import { getAllHivesAdminAction } from '@/lib/actions/admin.actions';
import HivesTable from '@/components/admin/hives-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminHivesPage({ searchParams }: Props) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAllHivesAdminAction(page, search);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">All Hives</h1>
      </div>
      <HivesTable {...data} />
    </div>
  );
}
