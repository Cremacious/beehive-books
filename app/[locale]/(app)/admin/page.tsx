import {
  getAdminStatsAction,
  getSignupChartDataAction,
  getPendingReportsCountAction,
  getCleanupStatsAction,
} from '@/lib/actions/admin.actions';
import StatCards from '@/components/admin/stat-cards';
import SignupChart from '@/components/admin/signup-chart';

export default async function AdminDashboardPage() {
  const [data, chartData, pendingReports, cleanupStats] = await Promise.all([
    getAdminStatsAction(),
    getSignupChartDataAction(),
    getPendingReportsCountAction(),
    getCleanupStatsAction(),
  ]);

  const bannedUsers = 0; // placeholder — add query if needed

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-yellow-500 uppercase tracking-widest mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          All time
        </h2>
        <StatCards data={data} />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Quick stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Pending Reports</p>
            <p className={`text-2xl font-bold ${pendingReports > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {pendingReports}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Banned Users</p>
            <p className="text-2xl font-bold text-white">{bannedUsers}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-white/80 mb-1">New Users (30d)</p>
            <p className="text-2xl font-bold text-white">{data.newThisMonth.users}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <SignupChart data={chartData} />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Database health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Old read notifications</p>
            <p className={`text-2xl font-bold ${cleanupStats.oldReadNotifications > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.oldReadNotifications}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Stale friend requests</p>
            <p className={`text-2xl font-bold ${cleanupStats.pendingFriendRequests > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.pendingFriendRequests}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-white/80 mb-1">Stale hive invites</p>
            <p className={`text-2xl font-bold ${cleanupStats.pendingHiveInvites > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.pendingHiveInvites}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Stale club invites</p>
            <p className={`text-2xl font-bold ${cleanupStats.pendingClubInvites > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.pendingClubInvites}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4">
            <p className="text-xs text-white/80 mb-1">Stale prompt invites</p>
            <p className={`text-2xl font-bold ${cleanupStats.pendingPromptInvites > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.pendingPromptInvites}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-white/80 mb-1">Stale join requests</p>
            <p className={`text-2xl font-bold ${(cleanupStats.pendingHiveJoinRequests + cleanupStats.pendingClubJoinRequests) > 0 ? 'text-yellow-500' : 'text-white'}`}>
              {cleanupStats.pendingHiveJoinRequests + cleanupStats.pendingClubJoinRequests}
            </p>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Rows eligible for next nightly cleanup (3am UTC). Cron runs automatically via Vercel.
        </p>
      </section>
    </div>
  );
}
