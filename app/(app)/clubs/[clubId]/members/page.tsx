import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClubAction, getClubMembersAction } from '@/lib/actions/club.actions';
import MembersGrid from '@/components/clubs/members-grid';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return {
    title: club ? `${club.name} — Members` : 'Members',
    description: club ? `See all members of the ${club.name} book club.` : 'Club members.',
  };
}

export default async function ClubMembersPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const { userId } = await auth();

  const club = await getClubAction(clubId);
  if (!club) notFound();

  const members = await getClubMembersAction(clubId);

  return (
    <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto">
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {club.name}
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-white/80 text-sm mt-0.5">
            {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
      <MembersGrid
        members={members}
        clubId={clubId}
        currentUserId={userId ?? ''}
        myRole={club.myRole ?? 'MEMBER'}
      />
    </div>
  );
}
