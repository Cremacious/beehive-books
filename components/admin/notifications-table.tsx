'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/shared/pagination';

type NotificationRow = {
  id: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: Date;
  recipientId: string;
  actorId: string | null;
  recipient: { username: string | null } | null;
  actor: { username: string | null } | null;
};

interface Props {
  notifications: NotificationRow[];
  total: number;
  page: number;
  pageSize: number;
}

export default function NotificationsTable({ notifications, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const updateUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) params.set('page', String(newPage)); else params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <p className="text-xs text-white/40 mb-3">{total.toLocaleString()} notifications</p>

      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white/50 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Actor</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Recipient</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {notifications.map((n) => (
              <tr key={n.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-xs text-[#FFC300]/70 bg-[#FFC300]/5 px-1.5 py-0.5 rounded">
                    {n.type}
                  </code>
                </td>
                <td className="px-4 py-3 text-white/60 hidden md:table-cell">
                  {n.actor?.username ? `@${n.actor.username}` : '—'}
                </td>
                <td className="px-4 py-3 text-white/60 hidden md:table-cell">
                  {n.recipient?.username ? `@${n.recipient.username}` : '—'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={
                      n.isRead
                        ? 'bg-white/5 text-white/30 border-transparent'
                        : 'bg-[#FFC300]/10 text-[#FFC300] border-transparent'
                    }
                  >
                    {n.isRead ? 'Read' : 'Unread'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs hidden lg:table-cell">
                  {new Date(n.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                  No notifications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={updateUrl} />
      </div>
    </div>
  );
}
