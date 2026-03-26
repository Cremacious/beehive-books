'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { dismissReportAction, removeReportedContentAction } from '@/lib/actions/admin.actions';

type ReportRow = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reporter: { username: string | null } | null;
};

interface Props {
  rows: ReportRow[];
  total: number;
  page: number;
  pageSize: number;
  statusFilter?: 'PENDING' | 'REVIEWED' | 'DISMISSED' | undefined;
}

const TARGET_TYPE_COLORS: Record<string, string> = {
  BOOK: 'bg-blue-500/10 text-white',
  COMMENT: 'bg-purple-500/10 text-white/80',
  BOOK_COMMENT: 'bg-indigo-500/10 text-white/80',
  CLUB: 'bg-green-500/10 text-white',
  PROMPT: 'bg-yellow-500/10 text-yellow-500',
  USER: 'bg-red-500/10 text-white/80',
};

function TargetTypeBadge({ type }: { type: string }) {
  const cls = TARGET_TYPE_COLORS[type] ?? 'bg-white/8 text-white/80';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {type.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
        PENDING
      </span>
    );
  }
  if (status === 'REVIEWED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/80">
        REVIEWED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/80">
      DISMISSED
    </span>
  );
}

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Dismissed', value: 'DISMISSED' },
] as const;

export default function ReportsTable({ rows, total, page, pageSize, statusFilter }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);

  const buildUrl = (newPage: number, status?: string) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    const s = status !== undefined ? status : (statusFilter ?? '');
    if (s) params.set('status', s);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const handleDismiss = (reportId: string) => {
    startTransition(async () => {
      await dismissReportAction(reportId);
      router.refresh();
    });
  };

  const handleRemoveContent = (reportId: string) => {
    startTransition(async () => {
      await removeReportedContentAction(reportId);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
        {TABS.map((tab) => {
          const active = (statusFilter ?? '') === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildUrl(1, tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-[#FFC300] text-yellow-500'
                  : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-white mb-3">{total.toLocaleString()} reports</p>

      {/* Mobile */}
      <div className="md:hidden rounded-2xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
        {rows.map((r) => (
          <div key={r.id} className="p-4 hover:bg-white/2 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <TargetTypeBadge type={r.targetType} />
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-white mb-1 line-clamp-2">{r.reason}</p>
            <div className="flex items-center gap-2 text-xs text-white/80 mb-3">
              {r.reporter?.username && <span>by @{r.reporter.username}</span>}
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              <span className="text-white/80 font-mono text-[10px] ml-auto truncate max-w-[120px]">{r.targetId}</span>
            </div>
            {r.status === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDismiss(r.id)}
                  disabled={pending}
                  className="border border-white/20 text-white/80 text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleRemoveContent(r.id)}
                  disabled={pending}
                  className="border border-red-500/30 text-white/80 text-xs px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Remove Content
                </button>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-white text-sm">No reports found.</p>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#252525]">
              <th className="text-left px-4 py-3 text-white font-medium">Reporter</th>
              <th className="text-left px-4 py-3 text-white font-medium">Type</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden lg:table-cell">Target ID</th>
              <th className="text-left px-4 py-3 text-white font-medium">Reason</th>
              <th className="text-left px-4 py-3 text-white font-medium hidden xl:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-white font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white/80">
                  {r.reporter?.username ? `@${r.reporter.username}` : <span className="italic text-white/80">unknown</span>}
                </td>
                <td className="px-4 py-3"><TargetTypeBadge type={r.targetType} /></td>
                <td className="px-4 py-3 text-white/80 font-mono text-xs hidden lg:table-cell truncate max-w-[120px]">
                  {r.targetId}
                </td>
                <td className="px-4 py-3 text-white/80 max-w-[240px]">
                  <span className="line-clamp-2">{r.reason}</span>
                </td>
                <td className="px-4 py-3 text-white/80 text-xs hidden xl:table-cell">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  {r.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDismiss(r.id)}
                        disabled={pending}
                        className="border border-white/20 text-white/80 text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleRemoveContent(r.id)}
                        disabled={pending}
                        className="border border-red-500/30 text-white/80 text-xs px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Remove Content
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white text-sm">No reports found.</td>
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
