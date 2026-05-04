import Link from 'next/link';
import { BookMarked, Compass, Lightbulb, List, Users, Users2 } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';

const communityLinks = [
  {
    href: '/explore/books',
    label: 'Explore Books',
    description: 'Find public writing and reader-facing book pages.',
    icon: Compass,
  },
  {
    href: '/clubs',
    label: 'Clubs',
    description: 'Join reading groups and community discussions.',
    icon: Users,
  },
  {
    href: '/sparks',
    label: 'Sparks',
    description: 'Browse writing prompts and community entries.',
    icon: Lightbulb,
  },
  {
    href: '/reading-lists',
    label: 'Reading Lists',
    description: 'Curate and discover lists of books worth reading.',
    icon: BookMarked,
  },
  {
    href: '/friends',
    label: 'Friends',
    description: 'Manage your writing and reading network.',
    icon: Users2,
  },
  {
    href: '/explore',
    label: 'Community Hub',
    description: 'Open the existing discovery hub while v2 Community evolves.',
    icon: List,
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-[#FFC300] mainFont">Discovery and feedback</p>
        <h1 className="mt-2 text-2xl font-bold text-white mainFont">Community</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
          Explore, comments, clubs, prompts, reading lists, and friends live here
          so writing stays central without hiding the social layer.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {communityLinks.map(({ href, label, description, icon: Icon }) => (
          <TactileSurface key={href} as="article" interactive className="p-5">
            <Link href={href} className="block">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC300]/12 text-[#FFC300]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2
                role={label === 'Community Hub' ? 'presentation' : undefined}
                className="text-lg font-bold text-white mainFont"
              >
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
            </Link>
          </TactileSurface>
        ))}
      </div>
    </div>
  );
}
