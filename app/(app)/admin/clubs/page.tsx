import { getAllClubsAdminAction } from '@/lib/actions/admin.actions';
import ClubsTable from '@/components/admin/clubs-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminClubsPage({ searchParams }: Props) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAllClubsAdminAction(page, search);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-widest mb-1">
          Community
        </p>
        <h1 className="text-2xl font-bold text-white">All Clubs</h1>
      </div>
      <ClubsTable {...data} />
    </div>
  );
}
