import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Library, Plus } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';

export const metadata: Metadata = {
  title: 'Write',
  description: 'Choose a book project to write on Beehive Books.',
};

const doorwayLinks = [
  {
    href: '/library',
    label: 'Open library',
    description: 'Find an existing book and enter its v2 project workspace.',
    icon: Library,
  },
  {
    href: '/library/create',
    label: 'Start a book',
    description: 'Create a project, then move into planning and drafting.',
    icon: Plus,
  },
];

export default function WriteDoorwayPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[#FFC300] mainFont">Write</p>
        <h1 className="mt-2 text-2xl font-bold text-white mainFont md:text-3xl">
          Choose a project
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/72">
          Open a book from your library to enter the v2 project workspace for drafting,
          planning, collaboration, publishing, and export.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {doorwayLinks.map(({ href, label, description, icon: Icon }) => (
          <TactileSurface key={href} as="article" interactive className="p-5">
            <Link href={href} className="block">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#FFC300]/20 bg-[#FFC300]/12 text-[#FFC300]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-white mainFont">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
            </Link>
          </TactileSurface>
        ))}
      </div>

      <TactileSurface as="section" grit className="flex items-start gap-3 p-5">
        <BookOpen aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#FFC300]" />
        <p className="text-sm leading-6 text-white/72">
          The full command center lives on each project at{' '}
          <span className="font-semibold text-[#FFC300]">/write/[bookId]</span>.
        </p>
      </TactileSurface>
    </div>
  );
}
