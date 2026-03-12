import { Users, BookOpen, BookText, Layers, Hexagon, Lightbulb } from 'lucide-react';

interface StatData {
  totals: {
    users: number;
    books: number;
    chapters: number;
    clubs: number;
    hives: number;
    prompts: number;
  };
  newThisMonth: {
    users: number;
    books: number;
    clubs: number;
    hives: number;
    prompts: number;
  };
}

const CARDS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'books', label: 'Books', icon: BookOpen },
  { key: 'chapters', label: 'Chapters', icon: BookText },
  { key: 'clubs', label: 'Clubs', icon: Layers },
  { key: 'hives', label: 'Hives', icon: Hexagon },
  { key: 'prompts', label: 'Prompts', icon: Lightbulb },
] as const;

export default function StatCards({ data }: { data: StatData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-[#FFC300]/10">
              <Icon className="w-4 h-4 text-[#FFC300]" />
            </div>
            <span className="text-sm font-medium text-white/60">{label}</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {data.totals[key].toLocaleString()}
          </p>
          {key !== 'chapters' && (
            <p className="text-xs text-white/40 mt-1">
              +{(data.newThisMonth as Record<string, number>)[key]} this month
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
