import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import HiveForm from '@/components/hive/hive-form';
import { getUserBooksAction } from '@/lib/actions/book.actions';

export const metadata = {
  title: 'Create Hive',
  description: 'Start a collaborative writing hive and build a book with your team.',
};

export default async function CreateHivePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const userBooks = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🐝</span>
          Create a Hive
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Bring writers and beta readers together to build something great.
        </p>
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <HiveForm mode="create" cancelHref="/hive" userBooks={userBooks} />
      </div>
    </div>
  );
}
