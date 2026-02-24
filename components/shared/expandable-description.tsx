'use client';

import { useState, useRef, useEffect } from 'react';

export function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, []);

  return (
    <div className="mt-3">
      <p
        ref={ref}
        className={`text-sm text-white leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}
      >
        {text}
      </p>
      {(isClamped || expanded) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-yellow-500 hover:text-yellow-400 mt-1.5 transition-colors"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
