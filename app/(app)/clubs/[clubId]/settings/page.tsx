import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClubAction } from '@/lib/actions/club.actions';
import EditClubForm from '@/components/clubs/edit-club-form';

export const metadata = {
  title: 'Club Settings',
  description: 'Manage your book club settings, name, description, and privacy.',
};

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const { userId } = await auth();

  const club = await getClubAction(clubId);
  if (!club) notFound();
  if (club.myRole !== 'OWNER') redirect(`/clubs/${clubId}`);

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {club.name}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Club Settings</h1>
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-6">
        <EditClubForm club={club} />
      </div>
    </div>
  );
}
