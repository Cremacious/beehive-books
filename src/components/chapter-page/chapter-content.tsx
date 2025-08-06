'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChapterType } from '@/lib/types/books.type';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fontOptions = [
  { label: 'Serif', value: 'serif' },
  { label: 'Garamond', value: 'garamond' },
  { label: 'Sans', value: 'sans-serif' },
  { label: 'Mono', value: 'monospace' },
];

const fontMap: Record<string, string> = {
  serif: 'serif',
  garamond: "'EB Garamond Variable', serif",
  'sans-serif': 'sans-serif',
  monospace: 'monospace',
};

export default function ChapterContent({ chapter }: { chapter: ChapterType }) {
  const [font, setFont] = useState(fontOptions[0].value);
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState('Medium');

  return (
    <div className="shadow-xl rounded-2xl md:p-6 p-1 bg-white border-b-8 border-b-yellow-400 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pt-2 px-2">
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
        <Select
          onValueChange={(value) => setFontSize(value)}
          defaultValue="Medium"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Large">Large</SelectItem>
            <SelectItem value="Extra Large">Extra Large</SelectItem>
            <SelectItem value="Super Large">Super Large</SelectItem>
          </SelectContent>
        </Select>
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
        } font-bold ${
          fontSize === 'Medium'
            ? 'text-md'
            : fontSize === 'Large'
            ? 'text-lg'
            : fontSize === 'Extra Large'
            ? 'text-xl'
            : 'text-2xl'
        } rounded-xl mb-4 border-2 p-2 md:p-6 shadow-inner min-h-[200px] transition-colors`}
        style={{ fontFamily: fontMap[font] }}
      >
        {chapter.content.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
