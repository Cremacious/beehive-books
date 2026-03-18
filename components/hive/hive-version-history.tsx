'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  History, Plus, RotateCcw, Trash2, Loader2, Eye, X, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getVersionSnapshotsAction,
  createVersionSnapshotAction,
  restoreVersionSnapshotAction,
  deleteVersionSnapshotAction,
} from '@/lib/actions/hive-version-snapshots.actions';
import type { VersionSnapshot, HiveRole } from '@/lib/types/hive.types';

interface HiveVersionHistoryProps {
  hiveId: string;
  bookId: string | null;
  chapters: { id: string; title: string; order: number }[];
  initialChapterId: string | null;
  initialSnapshots: VersionSnapshot[];
  currentUserId: string;
  myRole: HiveRole;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function PreviewModal({
  snapshot,
  onClose,
}: {
  snapshot: VersionSnapshot;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a] shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">{snapshot.name}</h3>
            <p className="text-xs text-white/80">{formatDate(snapshot.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-5 prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: snapshot.content || '<p class="text-white/80 italic">No content.</p>',
          }}
        />
      </div>
    </div>
  );
}

function SnapshotCard({
  snapshot,
  currentUserId,
  myRole,
  onRestore,
  onDelete,
  onPreview,
}: {
  snapshot: VersionSnapshot;
  currentUserId: string;
  myRole: HiveRole;
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPreview: (snapshot: VersionSnapshot) => void;
}) {
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canRestore = myRole === 'OWNER' || myRole === 'MODERATOR';
  const canDelete =
    snapshot.authorId === currentUserId || myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleRestore = async () => {
    if (
      !confirm(
        `Restore "${snapshot.name}"? This will overwrite the chapter's current content.`,
      )
    ) return;
    setRestoring(true);
    await onRestore(snapshot.id);
    setRestoring(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete snapshot "${snapshot.name}"?`)) return;
    setDeleting(true);
    await onDelete(snapshot.id);
    setDeleting(false);
  };

  return (
    <div className="flex items-start gap-4 rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 group">

      <div className="w-9 h-9 rounded-xl bg-[#FFC300]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Save className="w-4 h-4 text-[#FFC300]" />
      </div>


      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{snapshot.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-white/80">
            {snapshot.wordCount.toLocaleString()} words
          </span>
          <span className="text-xs text-white/80">·</span>
          <span className="text-xs text-white/80">{formatDate(snapshot.createdAt)}</span>
          <span className="text-xs text-white/80">·</span>
          <span className="flex items-center gap-1 text-xs text-white/80">
            {snapshot.author.image ? (
              <Image
                src={snapshot.author.image}
                alt=""
                width={14}
                height={14}
                className="rounded-full"
              />
            ) : null}
            {snapshot.author.username ?? 'User'}
          </span>
        </div>
      </div>

 
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onPreview(snapshot)}
          className="p-1.5 text-white/80 hover:text-white/80 transition-colors"
          title="Preview content"
        >
          <Eye className="w-4 h-4" />
        </button>
        {canRestore && (
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="p-1.5 text-white/80 hover:text-[#FFC300] transition-colors"
            title="Restore this snapshot"
          >
            {restoring
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RotateCcw className="w-4 h-4" />}
          </button>
        )}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-white/80 hover:text-red-400 transition-colors"
            title="Delete snapshot"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function HiveVersionHistory({
  hiveId,
  bookId,
  chapters,
  initialChapterId,
  initialSnapshots,
  currentUserId,
  myRole,
}: HiveVersionHistoryProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    initialChapterId ?? chapters[0]?.id ?? null,
  );
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(initialSnapshots);
  const [previewSnapshot, setPreviewSnapshot] = useState<VersionSnapshot | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [createError, setCreateError] = useState('');
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  const loadSnapshots = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSnapshots([]);
    startTransition(async () => {
      const fresh = await getVersionSnapshotsAction(hiveId, chapterId);
      setSnapshots(fresh);
    });
  };

  const handleCreate = async () => {
    if (!selectedChapterId || !snapshotName.trim()) return;
    setCreateError('');
    setCreating(true);
    const result = await createVersionSnapshotAction(hiveId, selectedChapterId, snapshotName);
    if (!result.success) {
      setCreateError(result.message);
      setCreating(false);
      return;
    }
    setSnapshotName('');
    setShowCreate(false);
    const fresh = await getVersionSnapshotsAction(hiveId, selectedChapterId);
    setSnapshots(fresh);
    setCreating(false);
  };

  const handleRestore = async (snapshotId: string) => {
    const result = await restoreVersionSnapshotAction(hiveId, snapshotId);
    if (!result.success) alert(result.message);
  };

  const handleDelete = async (snapshotId: string) => {
    await deleteVersionSnapshotAction(hiveId, snapshotId);
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
  };

  if (!bookId || chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
          <History className="w-6 h-6 text-[#FFC300]/40" />
        </div>
        <p className="text-sm text-white/80">
          {!bookId
            ? 'Link a book to this hive to use version history.'
            : 'No chapters available yet.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {previewSnapshot && (
        <PreviewModal snapshot={previewSnapshot} onClose={() => setPreviewSnapshot(null)} />
      )}

      <div className="space-y-4">
   
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedChapterId ?? ''}
            onChange={(e) => e.target.value && loadSnapshots(e.target.value)}
            className="flex-1 min-w-50 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {String(ch.order + 1).padStart(2, '0')}. {ch.title}
              </option>
            ))}
          </select>
          {!showCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              Save Snapshot
            </Button>
          )}
        </div>

    
        {showCreate && (
          <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <Save className="w-3.5 h-3.5 text-[#FFC300]" />
              Save current chapter as snapshot
            </h4>
            <input
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Snapshot name (e.g. &quot;Before Act 2 revisions&quot;)…"
              maxLength={100}
              autoFocus
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
            {createError && <p className="text-xs text-red-400">{createError}</p>}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowCreate(false); setSnapshotName(''); setCreateError(''); }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={creating || !snapshotName.trim()}>
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
            </div>
          </div>
        )}

  
        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
              <History className="w-6 h-6 text-[#FFC300]/40" />
            </div>
            <p className="text-sm text-white/80">
              No snapshots for this chapter yet.
            </p>
            <p className="text-xs text-white/80 max-w-xs">
              Save a snapshot before making big revisions so you can always roll back.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/80">
              {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}
              {myRole === 'OWNER' || myRole === 'MODERATOR'
                ? ' · hover to restore'
                : ' · hover to preview'}
            </p>
            {snapshots.map((snapshot) => (
              <SnapshotCard
                key={snapshot.id}
                snapshot={snapshot}
                currentUserId={currentUserId}
                myRole={myRole}
                onRestore={handleRestore}
                onDelete={handleDelete}
                onPreview={setPreviewSnapshot}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
