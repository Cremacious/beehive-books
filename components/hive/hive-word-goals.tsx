'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Target, Plus, Loader2, Flame, Calendar, Trophy, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getWordGoalsAction,
  getWordLogsAction,
  logWordsAction,
  createWordGoalAction,
  deactivateWordGoalAction,
} from '@/lib/actions/hive-word-goals.actions';
import type { WordGoal, WordLog, HiveRole, WordGoalType } from '@/lib/types/hive.types';

interface HiveWordGoalsProps {
  hiveId: string;
  initialGoals: WordGoal[];
  initialLogs: WordLog[];
  myRole: HiveRole;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const GOAL_TYPE_META: Record<
  WordGoalType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  DAILY: { label: 'Daily', icon: <Flame className="w-3 h-3" />, color: 'text-orange-400' },
  WEEKLY: { label: 'Weekly', icon: <Calendar className="w-3 h-3" />, color: 'text-blue-400' },
  TOTAL: { label: 'Total', icon: <Trophy className="w-3 h-3" />, color: 'text-[#FFC300]' },
};

function GoalCard({
  goal,
  myRole,
  onDeactivate,
}: {
  goal: WordGoal;
  myRole: HiveRole;
  onDeactivate: (id: string) => Promise<void>;
}) {
  const [deactivating, setDeactivating] = useState(false);
  const pct = Math.min(100, Math.round((goal.currentWords / goal.targetWords) * 100));
  const reached = pct >= 100;
  const meta = GOAL_TYPE_META[goal.type];
  const canDeactivate = myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this goal?')) return;
    setDeactivating(true);
    await onDeactivate(goal.id);
    setDeactivating(false);
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${
        goal.isActive ? 'bg-[#252525] border-[#2a2a2a]' : 'bg-[#1e1e1e] border-[#2a2a2a] opacity-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1 text-xs font-medium ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </span>
            {!goal.isActive && (
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
            {reached && goal.isActive && (
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                Reached!
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-white mt-1">
            {goal.currentWords.toLocaleString()}
            <span className="text-sm font-normal text-white/40">
              {' '}/ {goal.targetWords.toLocaleString()} words
            </span>
          </p>
        </div>
        <div className="text-2xl font-bold text-white/20 shrink-0">{pct}%</div>
      </div>

      <div className="h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${reached ? 'bg-green-500' : 'bg-[#FFC300]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 flex-wrap">
          {goal.endDate && (
            <span className="text-xs text-white/30">Ends {formatDate(goal.endDate)}</span>
          )}
          <span className="text-xs text-white/30">Started {formatDate(goal.startDate)}</span>
        </div>
        {canDeactivate && goal.isActive && (
          <button
            onClick={handleDeactivate}
            disabled={deactivating}
            className="p-1 text-white/30 hover:text-red-400 transition-colors"
            title="Deactivate goal"
          >
            {deactivating ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function HiveWordGoals({
  hiveId,
  initialGoals,
  initialLogs,
  myRole,
}: HiveWordGoalsProps) {
  const [goals, setGoals] = useState<WordGoal[]>(initialGoals);
  const [logs, setLogs] = useState<WordLog[]>(initialLogs);
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  // Log words form
  const [wordsInput, setWordsInput] = useState('');
  const [logError, setLogError] = useState('');
  const [logging, setLogging] = useState(false);

  // Create goal form
  const [goalType, setGoalType] = useState<WordGoalType>('WEEKLY');
  const [targetInput, setTargetInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const refresh = () => {
    startTransition(async () => {
      const [g, l] = await Promise.all([getWordGoalsAction(hiveId), getWordLogsAction(hiveId)]);
      setGoals(g);
      setLogs(l);
    });
  };

  const handleLog = async () => {
    const n = parseInt(wordsInput, 10);
    if (!Number.isFinite(n) || n < 1) {
      setLogError('Enter a positive number.');
      return;
    }
    setLogError('');
    setLogging(true);
    const result = await logWordsAction(hiveId, n);
    setLogging(false);
    if (!result.success) {
      setLogError(result.message);
      return;
    }
    setWordsInput('');
    refresh();
  };

  const handleDeactivate = async (goalId: string) => {
    await deactivateWordGoalAction(goalId);
    refresh();
  };

  const handleCreate = async () => {
    const n = parseInt(targetInput, 10);
    if (!Number.isFinite(n) || n < 1) {
      setCreateError('Target must be a positive number.');
      return;
    }
    setCreateError('');
    setCreating(true);
    const result = await createWordGoalAction(hiveId, goalType, n, endDateInput || undefined);
    setCreating(false);
    if (!result.success) {
      setCreateError(result.message);
      return;
    }
    setTargetInput('');
    setEndDateInput('');
    setShowCreate(false);
    refresh();
  };

  const canCreate = myRole === 'OWNER' || myRole === 'MODERATOR';
  const activeGoals = goals.filter((g) => g.isActive);
  const inactiveGoals = goals.filter((g) => !g.isActive);

  return (
    <div className="space-y-6">
      {/* Log words */}
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#FFC300]" />
          Log Words
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="100000"
            value={wordsInput}
            onChange={(e) => setWordsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLog();
            }}
            placeholder="How many words did you write?"
            className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <Button size="sm" onClick={handleLog} disabled={logging || !wordsInput}>
            {logging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log'}
          </Button>
        </div>
        {logError && <p className="text-xs text-red-400 mt-2">{logError}</p>}
      </div>

      {/* Goals section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#FFC300]" />
            Active Goals
          </h3>
          {canCreate && !showCreate && (
            <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Goal
            </Button>
          )}
        </div>

        {/* Create goal form */}
        {showCreate && (
          <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#FFC300]" />
              New word goal
            </h4>
            <div className="flex gap-2">
              {(['DAILY', 'WEEKLY', 'TOTAL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGoalType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    goalType === t
                      ? 'bg-[#FFC300] text-black'
                      : 'bg-[#1e1e1e] text-white/40 hover:text-white/70'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Target words (e.g. 10000)"
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
            <div>
              <label className="text-xs text-white/30 mb-1 block">End date (optional)</label>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
              />
            </div>
            {createError && <p className="text-xs text-red-400">{createError}</p>}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setCreateError('');
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={creating || !targetInput}>
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Goal'}
              </Button>
            </div>
          </div>
        )}

        {activeGoals.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center py-12 text-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#252525] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#FFC300]/40" />
            </div>
            <p className="text-sm text-white/40">No active goals yet.</p>
            {canCreate && (
              <p className="text-xs text-white/25">
                Create a goal to track the hive&apos;s writing progress.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.map((g) => (
              <GoalCard key={g.id} goal={g} myRole={myRole} onDeactivate={handleDeactivate} />
            ))}
          </div>
        )}

        {inactiveGoals.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-white/25">Past goals</p>
            {inactiveGoals.map((g) => (
              <GoalCard key={g.id} goal={g} myRole={myRole} onDeactivate={handleDeactivate} />
            ))}
          </div>
        )}
      </div>

      {/* Recent logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Recent Logs
          </h3>
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1e1e1e]"
              >
                {log.user.imageUrl ? (
                  <Image
                    src={log.user.imageUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FFC300]/20 shrink-0" />
                )}
                <span className="text-sm text-white/60 flex-1 min-w-0 truncate">
                  {log.user.username ?? log.user.firstName ?? 'User'}
                </span>
                <span className="text-sm font-semibold text-[#FFC300] shrink-0">
                  +{log.wordsAdded.toLocaleString()}
                </span>
                <span className="text-xs text-white/25 shrink-0">{formatTime(log.loggedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
