'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterGroup {
  param: string;
  label: string;
  options: string[];
}

interface ExploreSidebarProps {
  filterGroups: FilterGroup[];
}

export function ExploreSidebar({ filterGroups }: ExploreSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function getSelected(param: string): string[] {
    const val = searchParams.get(param);
    return val ? val.split(',').filter(Boolean) : [];
  }

  function toggle(param: string, value: string) {
    const current = getSelected(param);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set(param, next.join(','));
    } else {
      params.delete(param);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    filterGroups.forEach((g) => params.delete(g.param));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const hasAnySelected = filterGroups.some((g) => getSelected(g.param).length > 0);

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 sticky top-[53px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-semibold text-white">Filters</span>
          </div>
          {hasAnySelected && (
            <button
              onClick={clearAll}
              className="text-xs text-white/80 hover:text-[#FFC300] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-5">
          {filterGroups.map((group) => {
            const selected = getSelected(group.param);
            return (
              <div key={group.param}>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.options.map((option) => {
                    const isChecked = selected.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div
                          onClick={() => toggle(group.param, option)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#FFC300] border-[#FFC300]'
                              : 'border-[#3a3a3a] bg-transparent group-hover:border-[#FFC300]/50'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          )}
                        </div>
                        <span
                          onClick={() => toggle(group.param, option)}
                          className={`text-sm transition-colors cursor-pointer ${
                            isChecked ? 'text-white' : 'text-white/80'
                          }`}
                        >
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
