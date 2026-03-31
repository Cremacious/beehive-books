import { NextResponse } from 'next/server';
import { runCleanupAction } from '@/lib/actions/cleanup.actions';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runCleanupAction();
    console.log('[cron/cleanup]', result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/cleanup] error', err);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
