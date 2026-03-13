import { Megaphone } from 'lucide-react';

interface Props {
  title: string;
  content: string;
  createdAt: Date;
}

export default function AnnouncementCard({ title, content, createdAt }: Props) {
  return (
    <div className="rounded-2xl border border-[#FFC300]/25 bg-[#FFC300]/5 px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-[#FFC300]/15 flex items-center justify-center shrink-0">
          <Megaphone className="w-3.5 h-3.5 text-[#FFC300]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFC300]/70">
          Announcement
        </span>
        <span className="ml-auto text-xs text-white">
          {new Date(createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}
