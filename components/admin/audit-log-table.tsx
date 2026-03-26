'use client';

import { useRouter, usePathname } from 'next/navigation';
import Pagination from '@/components/shared/pagination';

type AuditRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  note: string | null;
  createdAt: Date;
  admin: { username: string | null } | null;
};

interface Props {
  rows: AuditRow[];
  total: number;
  page: number;
  pageSize: number;
}

const ACTION_COLORS: Record<string, string> = {
  BAN_USER: 'bg-red-500/10 text-white/80',
  UNBAN_USER: 'bg-green-500/10 text-white',
  DELETE_USER: 'bg-red-500/15 text-white/80',
  DISMISS_REPORT: 'bg-white/5 text-white/80',
  DELETE_BOOK: 'bg-orange-500/10 text-white/80',
  DELETE_CLUB: 'bg-purple-500/10 text-white/80',
  DELETE_PROMPT: 'bg-blue-500/10 text-white/80',
  DELETE_COMMENT: 'bg-white/5 text-white/80',
  DELETE_BOOK_COMMENT: 'bg-white/5 text-white/80',
};

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? 'bg-white/5 text-white/80';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {action}
    </span>
  );
}

export default function AuditLogTable({ rows, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const totalPages = Math.ceil(total / pageSize);

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div>
      <p className="text-sm text-white mb-3">{total.toLocaleString()} entries</p>

      {/* Mobile */}
      <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
        {rows.map((r) => (
          <div key={r.id} className="p-4 hover:bg-white/2 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <ActionBadge action={r.action} />
              <span className="text-xs text-white/80">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-xs text-white/80 mb-0.5">
              Admin: <span className="text-white">{r.admin?.username ?? 'unknown'}</span>
            </p>
            <p className="text-xs text-white/80 mb-0.5">
              Target: <span className="text-white">{r.targetType}</span>
              {r.targetLabel && <span className="text-white"> — {r.targetLabel}</span>}
            </p>
            {r.note && <p className="text-xs text-white/80 mt-1 italic">{r.note}</p>}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-white text-sm">No audit log entries.</p>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white font-medium">Admin</th>
              <th className="text-left px-4 py-3 text-white font-medium">Action</th>
              <th className="text-left px-4 py-3 text-white font-medium">Type</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Target</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Note</th>
              <th className="text-left px-4 py-3 text-white font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white">{r.admin?.username ?? <span className="text-white/80 italic">unknown</span>}</td>
                <td className="px-4 py-3"><ActionBadge action={r.action} /></td>
                <td className="px-4 py-3 text-white/80">{r.targetType}</td>
                <td className="px-4 py-3 text-white/80 hidden lg:table-cell">
                  {r.targetLabel ?? <span className="font-mono text-xs">{r.targetId}</span>}
                </td>
                <td className="px-4 py-3 text-white/80 italic hidden xl:table-cell max-w-[200px]">
                  <span className="line-clamp-1">{r.note ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-white/80 text-xs">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white text-sm">No audit log entries.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => router.push(buildUrl(p))} />
      </div>
    </div>
  );
}
