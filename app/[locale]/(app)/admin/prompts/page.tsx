import {
  getAllPromptsAdminAction,
  getAllPromptEntriesAdminAction,
} from '@/lib/actions/admin.actions';
import PromptsTable from '@/components/admin/prompts-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string; tab?: string }>;
}

export default async function AdminPromptsPage({ searchParams }: Props) {
  const { page: pageStr, search, tab } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);

  const [promptsData, entriesData] = await Promise.all([
    getAllPromptsAdminAction(tab === 'prompts' || !tab ? page : 1, search),
    getAllPromptEntriesAdminAction(tab === 'entries' ? page : 1),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Prompts</h1>
      </div>
      <PromptsTable
        prompts={promptsData.prompts}
        promptsTotal={promptsData.total}
        promptsPage={promptsData.page}
        entries={entriesData.entries}
        entriesTotal={entriesData.total}
        entriesPage={entriesData.page}
        pageSize={25}
      />
    </div>
  );
}
