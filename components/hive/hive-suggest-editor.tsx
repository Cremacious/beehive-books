'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, X, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  getHiveChapterSuggestionsAction,
  createSuggestionAction,
  acceptSuggestionAction,
  rejectSuggestionAction,
  writeChapterContentAction,
} from '@/lib/actions/hive-suggestions.actions';
import type { HiveRole, HiveChapterSuggestion } from '@/lib/types/hive.types';

type EditorMode = 'Write' | 'Suggest' | 'View';

interface HiveSuggestEditorProps {
  hiveId: string;
  myRole: HiveRole;
  chapters: { id: string; title: string; order: number; content: string }[];
  initialChapterId: string;
  initialContent: string;
  initialSuggestions: HiveChapterSuggestion[];
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AuthorAvatar({ author }: { author: { username: string | null; image: string | null } }) {
  if (author.image) {
    return (
      <Image
        src={author.image}
        alt={author.username ?? ''}
        width={28}
        height={28}
        className="rounded-full"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] text-xs font-bold shrink-0">
      {(author.username ?? 'U')[0]?.toUpperCase()}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onClick,
}: {
  suggestion: HiveChapterSuggestion;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[#2a2a2a] bg-[#252525] hover:bg-[#2d2d2d] hover:border-yellow-500/30 p-3 space-y-2 transition-all"
    >
      <div className="flex items-center gap-2">
        <AuthorAvatar author={suggestion.author} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {suggestion.author.username ?? 'Member'}
          </p>
          <p className="text-[10px] text-white/80">{timeAgo(suggestion.createdAt)}</p>
        </div>
        <span className="text-xs font-bold text-yellow-500">Review</span>
      </div>
      <p className="text-xs text-white/80 truncate">{suggestion.chapter.title}</p>
      {suggestion.summary && (
        <p className="text-xs text-white/80 line-clamp-2 italic">{suggestion.summary}</p>
      )}
    </button>
  );
}

function SuggestionReviewPopup({
  suggestion,
  onClose,
  onAccepted,
  onRejected,
}: {
  suggestion: HiveChapterSuggestion;
  onClose: () => void;
  onAccepted: (id: string) => void;
  onRejected: (id: string) => void;
}) {
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAccept = () => {
    setError('');
    startTransition(async () => {
      const result = await acceptSuggestionAction(suggestion.id);
      if (!result.success) { setError(result.message); return; }
      onAccepted(suggestion.id);
      onClose();
    });
  };

  const handleReject = () => {
    setError('');
    startTransition(async () => {
      const result = await rejectSuggestionAction(suggestion.id, rejectNote);
      if (!result.success) { setError(result.message); return; }
      onRejected(suggestion.id);
      onClose();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/80 mb-1">Chapter</p>
        <p className="text-sm font-semibold text-white">{suggestion.chapter.title}</p>
      </div>

      <div className="flex items-center gap-2">
        <AuthorAvatar author={suggestion.author} />
        <span className="text-sm text-white/80">
          {suggestion.author.username ?? 'Member'} &middot; {timeAgo(suggestion.createdAt)}
        </span>
      </div>

      {suggestion.summary && (
        <div className="rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2">
          <p className="text-xs text-white/80 italic">{suggestion.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-white/80">Current Version</p>
          <div className="rounded-xl border border-[#2a2a2a] overflow-hidden max-h-80 overflow-y-auto">
            <RichTextEditor content={suggestion.originalContent} editable={false} />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-yellow-500">Suggested Version</p>
          <div className="rounded-xl border border-yellow-500/20 overflow-hidden max-h-80 overflow-y-auto">
            <RichTextEditor content={suggestion.suggestedContent} editable={false} />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {showRejectInput ? (
        <div className="space-y-2">
          <input
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Optional note for the author…"
            maxLength={500}
            className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRejectInput(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={handleAccept} disabled={isPending}>
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Accept
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setShowRejectInput(true)} disabled={isPending}>
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HiveSuggestEditor({
  hiveId,
  myRole,
  chapters,
  initialChapterId,
  initialContent,
  initialSuggestions,
}: HiveSuggestEditorProps) {
  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';
  const defaultMode: EditorMode = isMod ? 'Write' : 'Suggest';

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [chapterContent, setChapterContent] = useState(initialContent);
  const [editorContent, setEditorContent] = useState(initialContent);
  const [mode, setMode] = useState<EditorMode>(defaultMode);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState<HiveChapterSuggestion[]>(initialSuggestions);
  const [viewingSuggestion, setViewingSuggestion] = useState<HiveChapterSuggestion | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  const availableModes: EditorMode[] = isMod
    ? ['Write', 'Suggest', 'View']
    : ['Suggest', 'View'];

  const loadChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setSelectedChapterId(chapterId);
    setChapterContent(chapter.content);
    setEditorContent(chapter.content);
    setSummary('');
    setError('');
    setSaveMessage('');
    startTransition(async () => {
      if (isMod) {
        const fresh = await getHiveChapterSuggestionsAction(hiveId, chapterId);
        setSuggestions(fresh);
      }
    });
  };

  const handleWrite = () => {
    setError('');
    setSaveMessage('');
    startTransition(async () => {
      const result = await writeChapterContentAction(hiveId, selectedChapterId, editorContent);
      if (!result.success) { setError(result.message); return; }
      setChapterContent(editorContent);
      setSaveMessage('Chapter saved.');
    });
  };

  const handleSuggest = () => {
    setError('');
    setSaveMessage('');
    startTransition(async () => {
      const result = await createSuggestionAction(hiveId, selectedChapterId, editorContent, summary);
      if (!result.success) { setError(result.message); return; }
      setSaveMessage('Suggestion submitted.');
      setEditorContent(chapterContent);
      setSummary('');
    });
  };

  const handleAccepted = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    const chapter = chapters.find((c) => c.id === selectedChapterId);
    if (chapter) {
      const accepted = suggestions.find((s) => s.id === id);
      if (accepted) {
        setChapterContent(accepted.suggestedContent);
        setEditorContent(accepted.suggestedContent);
      }
    }
  };

  const handleRejected = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredSuggestions = suggestions.filter((s) => s.chapterId === selectedChapterId);

  return (
    <>
      <div className="space-y-5">
        {/* Header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedChapterId}
            onChange={(e) => e.target.value && loadChapter(e.target.value)}
            className="flex-1 min-w-50 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
          >
            {chapters.map((ch, index) => (
              <option key={ch.id} value={ch.id}>
                {String(index + 1).padStart(2, '0')}. {ch.title}
              </option>
            ))}
          </select>

          {/* Mode tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
            {availableModes.map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSaveMessage(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === m
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Editor panel */}
          <div className={`${isMod ? 'xl:col-span-3' : 'xl:col-span-5'} space-y-3`}>
            {mode === 'View' ? (
              <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
                <RichTextEditor editable={false} content={chapterContent} />
              </div>
            ) : (
              <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
                <RichTextEditor
                  key={`${selectedChapterId}-${mode}`}
                  content={editorContent}
                  editable={true}
                  onChange={setEditorContent}
                />
              </div>
            )}

            {mode === 'Suggest' && (
              <div className="space-y-2">
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of your changes (optional)…"
                  maxLength={300}
                  className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
                />
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
            {saveMessage && <p className="text-xs text-white/80">{saveMessage}</p>}

            {mode === 'Write' && (
              <div className="flex justify-end">
                <Button size="sm" onClick={handleWrite} disabled={isPending}>
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}

            {mode === 'Suggest' && (
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSuggest} disabled={isPending || !editorContent.trim()}>
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Suggestion
                </Button>
              </div>
            )}
          </div>

          {/* Suggestions panel — owners/mods only */}
          {isMod && (
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Pending Suggestions</h3>
                {filteredSuggestions.length > 0 && (
                  <span className="text-xs font-bold bg-yellow-500 text-black rounded-full px-2 py-0.5">
                    {filteredSuggestions.length}
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-150 overflow-y-auto pr-1">
                {filteredSuggestions.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center gap-2">
                    <p className="text-sm text-white/80">No pending suggestions for this chapter.</p>
                  </div>
                ) : (
                  filteredSuggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      suggestion={s}
                      onClick={() => setViewingSuggestion(s)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Popup
        open={viewingSuggestion !== null}
        onClose={() => setViewingSuggestion(null)}
        title="Review Suggestion"
        maxWidth="lg"
      >
        {viewingSuggestion && (
          <SuggestionReviewPopup
            suggestion={viewingSuggestion}
            onClose={() => setViewingSuggestion(null)}
            onAccepted={handleAccepted}
            onRejected={handleRejected}
          />
        )}
      </Popup>
    </>
  );
}
