'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  createFeatureFlagAction,
  toggleFeatureFlagAction,
  updateFeatureFlagRolloutAction,
  deleteFeatureFlagAction,
} from '@/lib/actions/admin.actions';
import type { FeatureFlagItem } from '@/lib/actions/admin.actions';

interface Props {
  flags: FeatureFlagItem[];
}

export default function FeatureFlagsTable({ flags }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  // Create form state
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState('');

  // Rollout editing state
  const [editingRollout, setEditingRollout] = useState<string | null>(null);
  const [rolloutValue, setRolloutValue] = useState(100);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleCreate() {
    setCreateError('');
    startTransition(async () => {
      const result = await createFeatureFlagAction(key, name, description);
      if (result.success) {
        setKey('');
        setName('');
        setDescription('');
        router.refresh();
      } else {
        setCreateError(result.message);
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleFeatureFlagAction(id);
      router.refresh();
    });
  }

  function startEditRollout(flag: FeatureFlagItem) {
    setEditingRollout(flag.id);
    setRolloutValue(flag.rolloutPercentage);
  }

  function handleSaveRollout(id: string) {
    startTransition(async () => {
      await updateFeatureFlagRolloutAction(id, rolloutValue);
      setEditingRollout(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startDeleting(async () => {
      await deleteFeatureFlagAction(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">

      {/* Create form */}
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FFC300]" />
          New Feature Flag
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                Key <span className="text-white/30">(unique slug, e.g. new_explore_ui)</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="my_feature_key"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFC300]/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Human-readable flag name"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFC300]/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this flag control?"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFC300]/40"
            />
          </div>
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          <Button
            onClick={handleCreate}
            disabled={isPending || !key.trim() || !name.trim()}
            className="bg-[#FFC300] text-black hover:bg-[#FFD54F] font-semibold"
          >
            {isPending ? 'Creating…' : 'Create Flag'}
          </Button>
        </div>
      </div>

      {/* Flags list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">
          All Flags ({flags.length})
        </h2>
        {flags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] py-12 text-center">
            <Flag className="w-6 h-6 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">No feature flags yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a] overflow-hidden">
            {flags.map((flag) => (
              <div key={flag.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{flag.name}</span>
                    <code className="text-xs text-[#FFC300]/80 bg-[#FFC300]/10 px-1.5 py-0.5 rounded font-mono">
                      {flag.key}
                    </code>
                    <Badge
                      variant={flag.enabled ? 'default' : 'outline'}
                      className={flag.enabled
                        ? 'text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'text-xs text-white/40 border-white/20'}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-white/50 mt-1">{flag.description}</p>
                  )}
                  <p className="text-xs text-white/25 mt-1">
                    Updated {new Date(flag.updatedAt).toLocaleDateString([], {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Rollout percentage */}
                <div className="flex items-center gap-2 shrink-0">
                  {editingRollout === flag.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rolloutValue}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setRolloutValue(Math.min(100, Math.max(0, v)));
                        }}
                        className="w-16 bg-[#1a1a1a] border border-[#FFC300]/40 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none"
                      />
                      <span className="text-xs text-white/50">%</span>
                      <Button
                        size="sm"
                        onClick={() => handleSaveRollout(flag.id)}
                        disabled={isPending}
                        className="bg-[#FFC300] text-black hover:bg-[#FFD54F] text-xs px-2 py-1 h-auto"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRollout(null)}
                        className="text-xs px-2 py-1 h-auto text-white/60"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditRollout(flag)}
                      className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg border border-[#2a2a2a] hover:border-white/20"
                    >
                      {flag.rolloutPercentage}% rollout
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(flag.id)}
                    disabled={isPending}
                    className={`text-xs h-8 ${flag.enabled
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {flag.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <button
                    onClick={() => setDeleteId(flag.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Feature Flag"
        description="This will permanently remove the feature flag. Any code that checks this flag will behave as if the flag is disabled."
        loading={isDeleting}
      />
    </div>
  );
}
