'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChapterType } from '@/lib/types/books.type';

//fonts Bookerly, Baskerville, Caecilia, and Futura,

const fontOptions = [
  { label: 'Serif', value: 'serif' },
  { label: 'Garamond', value: 'garamond' },
  { label: 'Sans', value: 'sans-serif' },
  { label: 'Mono', value: 'monospace' },
];

export default function ChapterContent({ chapter }: { chapter: ChapterType }) {
  const [font, setFont] = useState(fontOptions[0].value);
  const [dark, setDark] = useState(false);

  return (
    <div className="whiteContainer mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <label className="font-semibold text-slate-700">Font:</label>
          <select
            className="rounded-md border border-yellow-200 px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {fontOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-semibold text-slate-700">Dark Mode:</label>
          <Button
            type="button"
            variant={dark ? 'default' : 'secondary'}
            className={dark ? 'bg-yellow-700 text-white' : ''}
            onClick={() => setDark((d) => !d)}
          >
            {dark ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
      <div
        className={`prose prose-lg max-w-none ${
          dark ? 'bg-[#202020] text-white' : 'bg-white text-slate-800'
        } ${font}  font-bold font-lg rounded-xl border-2 p-6 shadow-inner min-h-[200px] transition-colors`}
        style={{ fontFamily: font }}
      >
        {chapter.content.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
