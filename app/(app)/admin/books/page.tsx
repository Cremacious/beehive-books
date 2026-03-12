import { getAllBooksAdminAction } from '@/lib/actions/admin.actions';
import BooksTable from '@/components/admin/books-table';

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminBooksPage({ searchParams }: Props) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1') || 1);
  const data = await getAllBooksAdminAction(page, search);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
     
        <h1 className="text-2xl font-bold text-white">All Books</h1>
      </div>
      <BooksTable {...data} />
    </div>
  );
}
