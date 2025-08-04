'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockChapter = {
  id: '1',
  title: 'The Discovery',
  author: 'Jane Writer',
  updatedAt: '2025-07-30',
  wordCount: 3250,
  comments: 2,
  content: `It was a golden morning when Maya first stumbled upon the hidden path. The air was thick with the scent of wildflowers, and the distant hum of bees promised adventure. As she stepped into the dappled sunlight, the world seemed to shimmer with possibility...\n\nShe followed the trail deeper, her heart pounding with excitement. Every step brought new wonders: ancient trees, sparkling streams, and the ever-present, gentle buzz of the hive.`,
};

const fontOptions = [
  { label: 'Serif', value: 'serif' },
  { label: 'Sans', value: 'sans-serif' },
  { label: 'Caveat', value: "'Caveat', cursive" },
  { label: 'Mono', value: 'monospace' },
];

export default function ChapterPage() {
  const [font, setFont] = useState(fontOptions[0].value);
  const [dark, setDark] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      <div className="darkContainer">
        <div className="whiteContainer mb-8">
          {/* Top: Chapter Details */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] mb-2">
                {mockChapter.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center text-slate-700 text-sm mb-2">
                <span>
                  by{' '}
                  <span className="font-semibold text-yellow-800">
                    {mockChapter.author}
                  </span>
                </span>
                <span>·</span>
                <span>Updated {mockChapter.updatedAt}</span>
                <span>·</span>
                <span>{mockChapter.wordCount.toLocaleString()} words</span>
                <span>·</span>
                <span>{mockChapter.comments} comments</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="../">← Back to Book</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area with Controls */}
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
            className="prose prose-lg max-w-none bg-[#202020] font-bold font-lg text-white rounded-xl border-2 p-6 shadow-inner min-h-[200px] transition-colors"
            style={{ fontFamily: font }}
          >
            {mockChapter.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="whiteContainer">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
            💬 Comments
          </h2>
          <div className="space-y-4 mb-6">
            {/* Example comment */}
            <div className="bg-yellow-100 rounded-lg p-4 border-l-4 border-yellow-400">
              <div className="font-semibold text-yellow-800 mb-1">
                Sam Reader
              </div>
              <div className="text-slate-800">
                Loved this chapter! The world feels so alive 🐝
              </div>
              <div className="text-xs text-slate-500 mt-1">2025-07-31</div>
            </div>
          </div>
          <form className="flex flex-col gap-2">
            <textarea
              className="rounded-lg border border-yellow-200 p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Add a comment..."
            />
            <div className="flex justify-end">
              <Button type="submit">Post Comment</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
