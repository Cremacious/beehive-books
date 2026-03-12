import { getAllUsersAdminAction } from '@/lib/actions/admin.actions';
import UsersTable from '@/components/admin/users-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAllUsersAdminAction(page, search);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-widest mb-1">
          Users
        </p>
        <h1 className="text-2xl font-bold text-white">All Users</h1>
      </div>
      <UsersTable {...data} />
    </div>
  );
}
