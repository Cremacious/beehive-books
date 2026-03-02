'use client';

import { useState, useTransition } from 'react';
import { FileText, Save, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { updateStyleGuideAction } from '@/lib/actions/hive-style-guide.actions';
import type { StyleGuideDoc, HiveRole } from '@/lib/types/hive.types';

interface HiveStyleGuideEditorProps {
  hiveId: string;
  doc: StyleGuideDoc | null;
  myRole: HiveRole;
}

function formatUpdated(date: Date) {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HiveStyleGuideEditor({
  hiveId,
  doc,
  myRole: _myRole,
}: HiveStyleGuideEditorProps) {
  const [content, setContent] = useState(doc?.content ?? '');
  const [lastSaved, setLastSaved] = useState<StyleGuideDoc | null>(doc);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const isDirty = content !== (lastSaved?.content ?? '');

  const handleSave = () => {
    setError('');
    startTransition(async () => {
      const result = await updateStyleGuideAction(hiveId, content);
      if (result.success) {
        setLastSaved((prev) => ({
          id: prev?.id ?? '',
          hiveId,
          content,
          updatedById: prev?.updatedById ?? null,
          updatedBy: prev?.updatedBy ?? null,
          updatedAt: new Date(),
        }));
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#FFC300] shrink-0" />
          <h2 className="text-sm font-semibold text-white">Style Guide</h2>
          {lastSaved?.updatedAt && (
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              Last saved {formatUpdated(lastSaved.updatedAt)}
              {lastSaved.updatedBy && (
                <> by {lastSaved.updatedBy.username ?? lastSaved.updatedBy.firstName ?? 'someone'}</>
              )}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !isDirty}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>
      )}


      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <RichTextEditor
          content={content}
          onChange={setContent}
          editable
        />
      </div>

      {isDirty && !isPending && (
        <p className="text-xs text-white/30 text-right">Unsaved changes</p>
      )}
    </div>
  );
}
