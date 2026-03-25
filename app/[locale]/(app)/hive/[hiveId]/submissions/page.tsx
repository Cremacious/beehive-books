import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHiveSubmissionsAction } from '@/lib/actions/hive-submissions.actions';
import HiveSubmissions from '@/components/hive/hive-submissions';

export const metadata = { title: 'Submissions' };

export default async function HiveSubmissionsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const data = await getHiveSubmissionsAction(hiveId);

  return (
    <HiveSubmissions
      hiveId={hiveId}
      hiveBookId={hive.bookId}
      data={data}
    />
  );
}
