import { auth } from '@clerk/nextjs/server';
import { getAllUserHivesAction } from '@/lib/actions/hive.actions';
import MyHives from '@/components/hive/my-hives';

export const metadata = {
  title: 'Hive',
  description:
    'Collaborate with writers and beta readers to build a book together. Join or create a Hive.',
};

export default async function HivePage() {
  const { userId } = await auth();

  const userHives = userId ? await getAllUserHivesAction() : [];

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto space-y-10">
      <MyHives hives={userHives} />
    </div>
  );
}
