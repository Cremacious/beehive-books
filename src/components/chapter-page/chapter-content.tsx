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
    <div className="darkContainer">
      <div className="shadow-xl rounded-2xl md:p-6 p-1 darkColor border-b-8 border-b-yellow-400 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 my-4">
          {/* Font */}
          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Font:</label>
            <select
              className="rounded-md border bg-white border-yellow-200 px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
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

          {/* Font Size */}
          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Font Size:</label>
            <Select
              onValueChange={(value) => setFontSize(value)}
              defaultValue="Medium"
            >
              <SelectTrigger className="w-[180px] text-slate-800 bg-white">
                <SelectValue placeholder="Select Font Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
                <SelectItem value="Extra Large">Extra Large</SelectItem>
                <SelectItem value="Super Large">Super Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dark Mode */}
          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Dark Mode:</label>

            <Button
              size={'sm'}
              type="button"
              variant={dark ? 'darkMode' : 'lightMode'}
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
          } rounded-xl mb-4 border-2 p-2 md:p-6 shadow-inner min-h-[800px] transition-colors`}
          style={{ fontFamily: fontMap[font] }}
        >
          {chapter.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>{' '}
    </div>
  );
}
