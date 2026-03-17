import { useDroppable } from '@dnd-kit/core';
import { FileText } from 'lucide-react';

export function UncategorizedZone({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'uncategorized' });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 px-6 py-3 transition-all border-y ${
        isOver
          ? 'border-[#FFC300]/40 bg-[#FFC300]/10'
          : 'border-transparent bg-[#1e1e1e]'
      }`}
    >
      <FileText
        className={`w-4 h-4 transition-colors ${isOver ? 'text-white/80' : 'text-white/80'}`}
      />
      <span
        className={`text-sm font-semibold transition-colors ${isOver ? 'text-white/80' : 'text-white/80'}`}
      >
        Uncategorized
      </span>
      {isOver && (
        <span className="text-xs text-[#FFC300]/60 ml-1">
          drop to move here
        </span>
      )}
    </div>
  );
}
