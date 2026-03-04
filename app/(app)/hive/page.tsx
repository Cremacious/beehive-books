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
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Collaboration Workspace
        </p>
        <h1 className="text-3xl font-bold text-white mainFont">My Hives</h1>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          Join or create a Hive to work with other writers and beta readers on
          building a book together.
        </p>
      </div>
      <MyHives hives={userHives} />
    </div>
  );
}
