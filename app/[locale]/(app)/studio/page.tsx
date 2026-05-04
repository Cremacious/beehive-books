import Link from 'next/link';
import { BookOpen, Feather, Hexagon, Library } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';

const studioLinks = [
  {
    href: '/library',
    label: 'Open Library',
    description: 'Review your books, drafts, chapters, and project status.',
    icon: Library,
  },
  {
    href: '/library/create',
    label: 'Start a Book',
    description: 'Create a new writing project from the existing book schema.',
    icon: Feather,
  },
  {
    href: '/write',
    label: 'Continue Writing',
    description: 'Jump into the current writing surfaces while the v2 workspace is built.',
    icon: BookOpen,
  },
  {
    href: '/hive',
    label: 'Writing Hives',
    description: 'Use existing collaborative writing spaces until workspace collaboration is migrated.',
    icon: Hexagon,
  },
];

export default function StudioPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-[#FFC300] mainFont">Writer studio</p>
        <h1 className="mt-2 text-2xl font-bold text-white mainFont">Studio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
          Your writing workbench. v2 will bring drafting, planning, collaboration,
          publishing, and export into each project workspace.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {studioLinks.map(({ href, label, description, icon: Icon }) => (
          <TactileSurface key={href} as="article" interactive className="p-5">
            <Link href={href} className="block">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC300]/12 text-[#FFC300]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-white mainFont">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
            </Link>
          </TactileSurface>
        ))}
      </div>
    </div>
  );
}
