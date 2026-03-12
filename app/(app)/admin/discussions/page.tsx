import {
  getAllDiscussionsAdminAction,
  getAllDiscussionRepliesAdminAction,
} from '@/lib/actions/admin.actions';
import DiscussionsTable from '@/components/admin/discussions-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string; tab?: string }>;
}

export default async function AdminDiscussionsPage({ searchParams }: Props) {
  const { page: pageStr, search, tab } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);

  const [discussionsData, repliesData] = await Promise.all([
    getAllDiscussionsAdminAction(
      tab === 'discussions' || !tab ? page : 1,
      search,
    ),
    getAllDiscussionRepliesAdminAction(tab === 'replies' ? page : 1),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Discussions</h1>
      </div>
      <DiscussionsTable
        discussions={discussionsData.discussions}
        discussionsTotal={discussionsData.total}
        discussionsPage={discussionsData.page}
        replies={repliesData.replies}
        repliesTotal={repliesData.total}
        repliesPage={repliesData.page}
        pageSize={25}
      />
    </div>
  );
}
