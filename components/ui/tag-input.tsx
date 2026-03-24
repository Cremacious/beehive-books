'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  placeholder?: string;
  emptyMessage?: string;
  error?: string;
}

export function TagInput({
  value,
  onChange,
  max = 10,
  placeholder = 'e.g. fantasy, sci-fi, thriller…',
  emptyMessage = 'No tags yet.',
  error,
}: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag() {
    const t = input.trim();
    if (!t || value.includes(t) || value.length >= max) return;
    onChange([...value, t]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="rounded-xl border border-[#2a2a2a] bg-[#252525] p-3 space-y-3">
        <div className="flex gap-2">
          <label htmlFor="tag-input" className="sr-only">Add a tag</label>
          <input
            id="tag-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!input.trim() || value.length >= max}
            aria-label="Add tag"
            className="px-3 py-2 rounded-lg bg-[#FFC300]/15 text-[#FFC300] hover:bg-[#FFC300]/25 disabled:opacity-30 transition-colors shrink-0"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>

        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-white bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag: ${tag}`}
                  className="text-white/80 hover:text-red-400 transition-colors"
                >
                  <X aria-hidden="true" className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/80 text-center py-1">{emptyMessage}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
