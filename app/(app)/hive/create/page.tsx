import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import HiveForm from '@/components/hive/hive-form';
import { getUserBooksAction } from '@/lib/actions/book.actions';

export const metadata = {
  title: 'Create Hive',
  description: 'Start a collaborative writing hive and build a book with your team.',
};

export default async function CreateHivePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) redirect('/sign-in');

  const userBooks = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">


      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <HiveForm mode="create" cancelHref="/hive" userBooks={userBooks} />
      </div>
    </div>
  );
}
