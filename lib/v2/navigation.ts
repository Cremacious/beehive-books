import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Home,
  Library,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

export type V2NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const v2PrimaryNavItems: V2NavItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: Home,
    match: (pathname) => matchesPath(pathname, '/home'),
  },
  {
    href: '/studio',
    label: 'Studio',
    icon: BookOpen,
    match: (pathname) =>
      matchesPath(pathname, '/studio') ||
      matchesPath(pathname, '/write') ||
      matchesPath(pathname, '/hive'),
  },
  {
    href: '/library',
    label: 'Library',
    icon: Library,
    match: (pathname) => matchesPath(pathname, '/library'),
  },
  {
    href: '/community',
    label: 'Community',
    icon: Sparkles,
    match: (pathname) =>
      matchesPath(pathname, '/community') ||
      matchesPath(pathname, '/explore') ||
      matchesPath(pathname, '/clubs') ||
      matchesPath(pathname, '/sparks') ||
      matchesPath(pathname, '/reading-lists') ||
      matchesPath(pathname, '/friends'),
  },
];

export const v2AccountNavItems: V2NavItem[] = [
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    match: (pathname) => matchesPath(pathname, '/settings'),
  },
  {
    href: '/u',
    label: 'Profile',
    icon: User,
    match: (pathname) => matchesPath(pathname, '/u'),
  },
];
