'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus,
  VoteIcon,
  X,
  CheckSquare,
  Square,
  Lock,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPollsAction,
  createPollAction,
  voteOnPollAction,
  closePollAction,
  deletePollAction,
} from '@/lib/actions/hive-polls.actions';
import type { PollWithResults, HiveRole } from '@/lib/types/hive.types';

interface HivePollListProps {
  hiveId: string;
  initialPolls: PollWithResults[];
  currentUserId: string;
  myRole: HiveRole;
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PollCard({
  poll,
  currentUserId,
  myRole,
  onVote,
  onClose,
  onDelete,
}: {
  poll: PollWithResults;
  currentUserId: string;
  myRole: HiveRole;
  onVote: (pollId: string, selected: number[]) => Promise<void>;
  onClose: (pollId: string) => Promise<void>;
  onDelete: (pollId: string) => Promise<void>;
}) {
  const [pendingOptions, setPendingOptions] = useState<number[]>(
    poll.mySelectedOptions ?? [],
  );
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showResults, setShowResults] = useState(
    poll.status === 'CLOSED' || poll.mySelectedOptions !== null,
  );

  const isClosed = poll.status === 'CLOSED';
  const hasVoted = poll.mySelectedOptions !== null;
  const canManage =
    poll.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const toggleOption = (idx: number) => {
    if (poll.isMultiChoice) {
      setPendingOptions((prev) =>
        prev.includes(idx) ? prev.filter((o) => o !== idx) : [...prev, idx],
      );
    } else {
      setPendingOptions([idx]);
    }
  };

  const handleVote = async () => {
    if (pendingOptions.length === 0 || voting) return;
    setVoting(true);
    await onVote(poll.id, pendingOptions);
    setVoting(false);
    setShowResults(true);
  };

  const handleClose = async () => {
    if (closing) return;
    setClosing(true);
    await onClose(poll.id);
    setClosing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this poll? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete(poll.id);
    setDeleting(false);
  };

  const maxCount = Math.max(...poll.optionCounts, 1);

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {poll.author.image ? (
            <Image
              src={poll.author.image}
              alt={poll.author.username ?? 'User'}
              width={28}
              height={28}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 text-[#FFC300] font-bold text-xs">
              {(poll.author.username ??
                poll.author.firstName ??
                'U')[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-white/40">
              {poll.author.username ?? poll.author.firstName ?? 'User'}
              {poll.endsAt && !isClosed && (
                <span className="ml-2 text-white/30">
                  · Ends {formatDate(poll.endsAt)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isClosed ? (
            <span className="flex items-center gap-1 text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> Closed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#FFC300]/70 bg-[#FFC300]/10 px-2 py-0.5 rounded-full">
              <VoteIcon className="w-3 h-3" /> Active
            </span>
          )}
          {canManage && (
            <>
              {!isClosed && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="p-1 text-white/30 hover:text-white/60 transition-colors"
                  title="Close poll"
                >
                  {closing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
                title="Delete poll"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold text-white leading-snug">
        {poll.question}
      </p>

      {showResults ? (
        <div className="space-y-2">
          {poll.options.map((option, idx) => {
            const count = poll.optionCounts[idx] ?? 0;
            const pct =
              poll.totalVotes > 0
                ? Math.round((count / poll.totalVotes) * 100)
                : 0;
            const isWinner = !isClosed
              ? false
              : count === maxCount && count > 0;
            const myPick = poll.mySelectedOptions?.includes(idx);
            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`${myPick ? 'text-[#FFC300]' : 'text-white/70'} flex items-center gap-1.5`}
                  >
                    {myPick && (
                      <CheckSquare className="w-3 h-3 text-[#FFC300] shrink-0" />
                    )}
                    {option}
                    {isWinner && (
                      <span className="text-[#FFC300]/60 text-[10px] ml-1">
                        ★ Winner
                      </span>
                    )}
                  </span>
                  <span className="text-white/40 ml-4 shrink-0">
                    {pct}% · {count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${myPick ? 'bg-[#FFC300]' : 'bg-[#FFC300]/30'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-white/30 pt-1">
            {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
            {poll.isMultiChoice && ' · multi-choice'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {poll.options.map((option, idx) => {
            const selected = pendingOptions.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleOption(idx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                  selected
                    ? 'border-[#FFC300]/50 bg-[#FFC300]/8 text-[#FFC300]'
                    : 'border-[#2a2a2a] bg-[#1e1e1e] text-white hover:border-white/20'
                }`}
              >
                {poll.isMultiChoice ? (
                  selected ? (
                    <CheckSquare className="w-4 h-4 shrink-0 text-[#FFC300]" />
                  ) : (
                    <Square className="w-4 h-4 shrink-0 text-white/30" />
                  )
                ) : (
                  <div
                    className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      selected
                        ? 'border-[#FFC300] bg-[#FFC300]'
                        : 'border-white/20'
                    }`}
                  >
                    {selected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                    )}
                  </div>
                )}
                {option}
              </button>
            );
          })}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowResults(true)}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              View results
            </button>
            <Button
              size="sm"
              onClick={handleVote}
              disabled={pendingOptions.length === 0 || voting}
            >
              {voting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {hasVoted ? 'Update Vote' : 'Vote'}
            </Button>
          </div>
        </div>
      )}

      {showResults && !isClosed && (
        <button
          onClick={() => setShowResults(false)}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          {hasVoted ? 'Change my vote' : 'Cast a vote'}
        </button>
      )}
    </div>
  );
}

function CreatePollForm({
  hiveId,
  onCreate,
  onCancel,
}: {
  hiveId: string;
  onCreate: (poll: PollWithResults) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const updateOption = (idx: number, val: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const result = await createPollAction(
        hiveId,
        question,
        options,
        isMultiChoice,
        endsAt || undefined,
      );
      if (!result.success) {
        setError(result.message);
        return;
      }

      const fresh = await getPollsAction(hiveId);
      const created = fresh.find((p) => p.id === result.pollId);
      if (created) onCreate(created);
    });
  };

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <VoteIcon className="w-4 h-4 text-[#FFC300]" />
        New Poll
      </h3>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask the hive a question…"
        maxLength={300}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <div className="space-y-2">
        <p className="text-xs text-white/80 font-medium">Options</p>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              maxLength={200}
              className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add option
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setIsMultiChoice(!isMultiChoice)}
            className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
              isMultiChoice ? 'bg-[#FFC300]' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                isMultiChoice ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs text-white/80">Allow multiple choices</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/80">Ends</span>
          <input
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !question.trim()}
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Create Poll
        </Button>
      </div>
    </div>
  );
}

export default function HivePollList({
  hiveId,
  initialPolls,
  currentUserId,
  myRole,
}: HivePollListProps) {
  const [polls, setPolls] = useState<PollWithResults[]>(initialPolls);
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const fresh = await getPollsAction(hiveId);
      setPolls(fresh);
    });
  };

  const handleVote = async (pollId: string, selected: number[]) => {
    await voteOnPollAction(pollId, selected);
    refresh();
  };

  const handleClose = async (pollId: string) => {
    await closePollAction(pollId);
    refresh();
  };

  const handleDelete = async (pollId: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
    await deletePollAction(pollId);
  };

  const handleCreated = (poll: PollWithResults) => {
    setPolls((prev) => [poll, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">
          {polls.length} poll{polls.length !== 1 ? 's' : ''}
        </p>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Poll
          </Button>
        )}
      </div>

      {showCreate && (
        <CreatePollForm
          hiveId={hiveId}
          onCreate={handleCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {polls.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
            <VoteIcon className="w-6 h-6 text-[#FFC300]/40" />
          </div>
          <p className="text-sm text-white/40">
            No polls yet. Start one to get the hive&apos;s opinion!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              myRole={myRole}
              onVote={handleVote}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
