import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import BackButton from '@/components/shared/back-button';
import { getClubAction } from '@/lib/actions/club.actions';
import CreateClubDiscussionForm from '@/components/clubs/create-club-discussion-form';

export const metadata = {
  title: 'New Discussion',
  description: 'Start a new discussion thread in your book club.',
};

export default async function CreateDiscussionPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const club = await getClubAction(clubId);
  if (!club) notFound();
  if (!club.isMember) redirect(`/clubs/${clubId}`);

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <BackButton href={`/clubs/${clubId}/discussions`} label="Discussions" className="mb-6" />
      <h1 className="text-2xl font-bold text-white mb-6 mainFont">Start a Discussion</h1>
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-6">
        <CreateClubDiscussionForm clubId={clubId} />
      </div>
    </div>
  );
}
