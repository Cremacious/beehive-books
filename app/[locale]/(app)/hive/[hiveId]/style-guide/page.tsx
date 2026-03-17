import { notFound } from 'next/navigation';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getStyleGuideAction } from '@/lib/actions/hive-style-guide.actions';
import HiveStyleGuideEditor from '@/components/hive/hive-style-guide-editor';

export const metadata = { title: 'Style Guide' };

export default async function HiveStyleGuidePage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const doc = await getStyleGuideAction(hiveId);

  return (
    <HiveStyleGuideEditor
      hiveId={hiveId}
      doc={doc}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
