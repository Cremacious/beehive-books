interface GeneratedCoverProps {
  title: string;
  author: string;
  bookId: string;
}

function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return hash % 360;
}

export function GeneratedCover({ title, author, bookId }: GeneratedCoverProps) {
  const hue = hueFromId(bookId);
  const hue2 = (hue + 40) % 360;

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-3"
      style={{
        background: `linear-gradient(145deg, hsl(${hue},35%,14%) 0%, hsl(${hue2},25%,8%) 100%)`,
      }}
    >
      <div
        className="w-8 h-1 rounded-full opacity-60"
        style={{ background: `hsl(${hue},70%,55%)` }}
      />
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 leading-tight"
          style={{ color: `hsl(${hue},70%,70%)` }}
        >
          {author}
        </p>
        <p className="text-xs font-bold text-white leading-snug line-clamp-4 mainFont">
          {title}
        </p>
      </div>
    </div>
  );
}
