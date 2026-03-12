import { getAdminStatsAction } from '@/lib/actions/admin.actions';
import StatCards from '@/components/admin/stat-cards';

export default async function AdminDashboardPage() {
  const data = await getAdminStatsAction();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-widest mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          All time
        </h2>
        <StatCards data={data} />
      </section>
    </div>
  );
}
