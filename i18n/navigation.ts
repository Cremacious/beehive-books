import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation hooks and components.
// Use these instead of next/navigation equivalents when you need locale support.
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
