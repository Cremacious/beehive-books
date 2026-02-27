import { notFound } from 'next/navigation';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { Sparkles } from 'lucide-react';

export default async function HiveBuzzPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#252525] flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-[#FFC300]/60" />
      </div>
      <h2 className="text-lg font-semibold text-white/80 mb-1">Buzz Board</h2>
      <p className="text-sm text-white/50 max-w-xs">
        Share inspiration, playlists, mood boards, and anything that fuels the hive. Coming in Phase 5.
      </p>
    </div>
  );
}
