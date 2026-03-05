'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Timer, Play, Users, Check, Square, Loader2, Trophy, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getActiveSprintAction,
  getPastSprintsAction,
  startSprintAction,
  joinSprintAction,
  submitWordsAction,
  endSprintAction,
} from '@/lib/actions/hive-sprints.actions';
import type { SprintWithParticipants, HiveRole } from '@/lib/types/hive.types';

interface HiveSprintProps {
  hiveId: string;
  initialActiveSprint: SprintWithParticipants | null;
  initialPastSprints: SprintWithParticipants[];
  myRole: HiveRole;
  currentUserId: string;
}

const DURATIONS = [10, 15, 20, 25, 30, 45, 60] as const;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ParticipantRow({
  p,
  isWinner,
}: {
  p: SprintWithParticipants['participants'][number];
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {p.user.imageUrl ? (
        <Image
          src={p.user.imageUrl}
          alt=""
          width={24}
          height={24}
          className="rounded-full shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#FFC300]/20 shrink-0" />
      )}
      <span className="flex-1 text-sm text-white/70 truncate min-w-0">
        {p.user.username ?? p.user.firstName ?? 'User'}
      </span>
      {isWinner && <Trophy className="w-3.5 h-3.5 text-[#FFC300] shrink-0" />}
      {p.wordsWritten !== null ? (
        <span className="text-sm font-semibold text-[#FFC300] shrink-0">
          +{p.wordsWritten.toLocaleString()} words
        </span>
      ) : (
        <span className="text-xs text-white/25 shrink-0">—</span>
      )}
    </div>
  );
}

function ActiveSprint({
  sprint,
  hiveId,
  myRole,
  currentUserId,
  onRefresh,
}: {
  sprint: SprintWithParticipants;
  hiveId: string;
  myRole: HiveRole;
  currentUserId: string;
  onRefresh: () => void;
}) {
  const endMs =
    new Date(sprint.startTime).getTime() + sprint.durationMinutes * 60 * 1000;
  const [remaining, setRemaining] = useState(() => Math.max(0, endMs - Date.now()));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, endMs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const myParticipant = sprint.participants.find((p) => p.userId === currentUserId);
  const hasJoined = !!myParticipant;
  const hasSubmitted = myParticipant?.wordsAfter !== null;

  const [wordsBeforeInput, setWordsBeforeInput] = useState('0');
  const [wordsAfterInput, setWordsAfterInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');

  const timeUp = remaining <= 0;
  const canEnd =
    sprint.startedById === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh();
    setRefreshing(false);
  };

  const handleJoin = async () => {
    setError('');
    setJoining(true);
    const result = await joinSprintAction(
      hiveId,
      sprint.id,
      parseInt(wordsBeforeInput, 10) || 0,
    );
    setJoining(false);
    if (!result.success) {
      setError(result.message);
    } else {
      onRefresh();
    }
  };

  const handleSubmit = async () => {
    const n = parseInt(wordsAfterInput, 10);
    if (!Number.isFinite(n) || n < 0) {
      setError('Enter a valid word count.');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await submitWordsAction(hiveId, sprint.id, n);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
    } else {
      onRefresh();
    }
  };

  const handleEnd = async () => {
    if (!confirm('End the sprint now?')) return;
    setEnding(true);
    await endSprintAction(hiveId, sprint.id);
    setEnding(false);
    onRefresh();
  };

  const progressPct = Math.max(
    0,
    (remaining / (sprint.durationMinutes * 60 * 1000)) * 100,
  );

  return (
    <div className="space-y-4">
 
      <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-xs text-[#FFC300] font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          Sprint Active
        </div>
        <div
          className={`text-6xl font-mono font-bold mb-1 tabular-nums transition-colors ${
            timeUp ? 'text-red-400' : 'text-white'
          }`}
        >
          {timeUp ? "Time's Up!" : formatCountdown(remaining)}
        </div>
        <p className="text-xs text-white/30">{sprint.durationMinutes} min sprint</p>
        <div className="mt-4 h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFC300] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>


      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            {sprint.participants.length} Participant
            {sprint.participants.length !== 1 ? 's' : ''}
          </h4>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 text-white/30 hover:text-white/60 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {sprint.participants.length === 0 ? (
          <p className="text-xs text-white/30 py-2">No participants yet.</p>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {sprint.participants.map((p) => (
              <ParticipantRow key={p.id} p={p} isWinner={false} />
            ))}
          </div>
        )}
      </div>

      {!hasJoined && (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Join Sprint
          </h4>
          <div>
            <label className="text-xs text-yellow-500 mainFont mb-1 block">
              Your current word count (before writing)
            </label>
            <input
              type="number"
              min="0"
              value={wordsBeforeInput}
              onChange={(e) => setWordsBeforeInput(e.target.value)}
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button size="sm" onClick={handleJoin} disabled={joining}>
            {joining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Join Sprint
          </Button>
        </div>
      )}


      {hasJoined && !hasSubmitted && (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Submit Your Words
          </h4>
          <div>
            <label className="text-xs text-yellow-500 mainFont mb-1 block">
              Your word count now (after writing)
            </label>
            <input
              type="number"
              min="0"
              value={wordsAfterInput}
              onChange={(e) => setWordsAfterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder={`Started at ${myParticipant?.wordsBefore.toLocaleString()}`}
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !wordsAfterInput}
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Submit Words
          </Button>
        </div>
      )}

      {hasJoined && hasSubmitted && (
        <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-center">
          <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-sm text-green-400 font-medium">Words submitted!</p>
          <p className="text-xs text-white/30 mt-0.5">
            You wrote{' '}
            {(
              (myParticipant!.wordsAfter ?? myParticipant!.wordsBefore) -
              myParticipant!.wordsBefore
            ).toLocaleString()}{' '}
            words.
          </p>
        </div>
      )}


      {canEnd && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnd}
          disabled={ending}
          className="w-full"
        >
          {ending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          End Sprint
        </Button>
      )}
    </div>
  );
}

export default function HiveSprint({
  hiveId,
  initialActiveSprint,
  initialPastSprints,
  myRole,
  currentUserId,
}: HiveSprintProps) {
  const [activeSprint, setActiveSprint] = useState<SprintWithParticipants | null>(
    initialActiveSprint,
  );
  const [pastSprints, setPastSprints] = useState<SprintWithParticipants[]>(initialPastSprints);
  const [, startTransition] = useTransition();


  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(25);
  const [wordsBeforeInput, setWordsBeforeInput] = useState('0');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const refresh = () => {
    startTransition(async () => {
      const [active, past] = await Promise.all([
        getActiveSprintAction(hiveId),
        getPastSprintsAction(hiveId),
      ]);
      setActiveSprint(active);
      setPastSprints(past);
    });
  };

  const handleStart = async () => {
    setStartError('');
    setStarting(true);
    const result = await startSprintAction(
      hiveId,
      duration,
      parseInt(wordsBeforeInput, 10) || 0,
    );
    setStarting(false);
    if (!result.success) {
      setStartError(result.message);
      return;
    }
    refresh();
  };

  if (activeSprint) {
    return (
      <ActiveSprint
        sprint={activeSprint}
        hiveId={hiveId}
        myRole={myRole}
        currentUserId={currentUserId}
        onRefresh={refresh}
      />
    );
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#FFC300]" />
          Start a Sprint
        </h3>
        <div>
          <label className="text-xs text-yellow-500 mainFont mb-2 block">Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  duration === d
                    ? 'bg-[#FFC300] text-black'
                    : 'bg-[#1e1e1e] text-white/40 hover:text-white/70'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-yellow-500 mainFont mb-1 block">
            Your starting word count
          </label>
          <input
            type="number"
            min="0"
            value={wordsBeforeInput}
            onChange={(e) => setWordsBeforeInput(e.target.value)}
            className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
        </div>
        {startError && <p className="text-xs text-red-400">{startError}</p>}
        <Button onClick={handleStart} disabled={starting} className="w-full">
          {starting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Start {duration}-Minute Sprint
        </Button>
      </div>

 
      {pastSprints.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Past Sprints
          </h3>
          {pastSprints.map((s) => {
            const sorted = [...s.participants]
              .filter((p) => p.wordsWritten !== null)
              .sort((a, b) => (b.wordsWritten ?? 0) - (a.wordsWritten ?? 0));
            return (
              <div key={s.id} className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">{formatDate(s.startTime)}</span>
                  <span className="text-xs text-white/30">{s.durationMinutes} min</span>
                </div>
                <div className="divide-y divide-[#2a2a2a]">
                  {sorted.length === 0 ? (
                    <p className="text-xs text-white/25 py-2">No submissions.</p>
                  ) : (
                    sorted.map((p, i) => (
                      <ParticipantRow
                        key={p.id}
                        p={p}
                        isWinner={i === 0 && s.winnerId === p.userId}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
            <Timer className="w-6 h-6 text-[#FFC300]/40" />
          </div>
          <p className="text-sm text-white/40">No sprints yet.</p>
          <p className="text-xs text-white/25 max-w-xs">
            Start a sprint to write together with your hive members.
          </p>
        </div>
      )}
    </div>
  );
}
