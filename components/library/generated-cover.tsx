function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

const GRADIENTS = [
  ['#1a1a2e', '#16213e'], // deep navy
  ['#1a0a0a', '#2d1515'], // deep crimson
  ['#0a1a0a', '#152d15'], // deep forest
  ['#1a1a0a', '#2d2d15'], // deep amber
  ['#0a0a1a', '#15152d'], // deep indigo
  ['#1a0a1a', '#2d152d'], // deep plum
  ['#0a1a1a', '#152d2d'], // deep teal
  ['#1a0f00', '#2d1a00'], // deep bronze
];

// Encoded honeycomb SVG pattern (white, 5% opacity)
const HONEYCOMB =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.3h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export function GeneratedCover({
  title,
  author,
  bookId,
  className,
}: {
  title: string;
  author?: string;
  bookId: string;
  className?: string;
}) {
  const [from, to] = GRADIENTS[hashId(bookId) % GRADIENTS.length];

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden${className ? ` ${className}` : ''}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {/* Honeycomb texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: HONEYCOMB, backgroundSize: '28px 49px' }}
      />
      {/* Text */}
      <div className="relative z-10 flex flex-col items-center gap-1 w-full px-2">
        <p className="text-white font-bold text-sm mainFont line-clamp-2 text-center leading-snug">
          {title}
        </p>
        {author && (
          <p className="text-white/80 text-xs text-center line-clamp-1 w-full">
            {author}
          </p>
        )}
      </div>
    </div>
  );
}
