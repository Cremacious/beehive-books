import { getAllFeatureFlagsAdminAction } from '@/lib/actions/admin.actions';
import FeatureFlagsTable from '@/components/admin/feature-flags-table';

export default async function AdminFeatureFlagsPage() {
  const flags = await getAllFeatureFlagsAdminAction();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-sm text-white/40 mt-1">
          Gradually roll out features to subsets of users, or toggle them on/off instantly.
        </p>
      </div>
      <FeatureFlagsTable flags={flags} />
    </div>
  );
}
