import { getAllAnnouncementsAdminAction } from '@/lib/actions/admin.actions';
import AnnouncementsTable from '@/components/admin/announcements-table';

export default async function AdminAnnouncementsPage() {
  const announcements = await getAllAnnouncementsAdminAction();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <p className="text-sm text-white/40 mt-1">
          Post site-wide announcements visible to all users on the feed.
        </p>
      </div>
      <AnnouncementsTable announcements={announcements} />
    </div>
  );
}
