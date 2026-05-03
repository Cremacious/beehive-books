# Beehive Books v2 Foundation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v2 foundation shell: simplified workspace-first navigation, tactile paper UI utilities, route skeletons for Studio and Community, and Playwright smoke coverage.

**Architecture:** This plan keeps the existing schema and auth flow intact. It replaces the authenticated app shell surface with focused v2 navigation while preserving existing feature routes behind Studio, Library, and Community entry points.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, better-auth, Drizzle, Playwright.

---

## Scope

This plan implements only the v2 foundation. It does not build the adaptive project workspace, import/repair pipeline, Plus entitlements, ads, or CI. Those are separate follow-up plans in `docs/superpowers/plans/2026-05-03-beehive-v2-plan-set.md`.

## File Structure

- Create: `lib/v2/navigation.ts`
  - Single source of truth for v2 nav destinations and labels.
- Create: `components/v2/tactile-surface.tsx`
  - Reusable stacked-paper surface component for cards and panels.
- Create: `components/v2/app-shell.tsx`
  - Server-safe shell wrapper for authenticated app content.
- Create: `components/v2/desktop-nav.tsx`
  - Client desktop navigation using v2 nav config.
- Create: `components/v2/mobile-nav.tsx`
  - Client mobile top bar and drawer using v2 nav config.
- Create: `app/[locale]/(app)/studio/page.tsx`
  - Studio doorway skeleton that links writing work to existing library/write/hive routes.
- Create: `app/[locale]/(app)/community/page.tsx`
  - Community doorway skeleton that links to existing Explore, Clubs, Sparks, Reading Lists, and Friends routes.
- Modify: `app/[locale]/(app)/layout.tsx`
  - Replace old global nav components with v2 app shell.
- Modify: `app/globals.css`
  - Add tactile paper utilities and low-contrast grit background utility.
- Modify: `DESIGN_SYSTEM.md`
  - Document tactile paper UI rules so future UI work has the same visual language.
- Create: `tests/e2e/v2/shell.spec.ts`
  - Playwright smoke tests for desktop/mobile nav, Studio doorway, Community doorway, and authenticated shell structure.

---

### Task 1: Add Playwright Shell Smoke Tests

**Files:**
- Create: `tests/e2e/v2/shell.spec.ts`

- [ ] **Step 1: Write the failing Playwright tests**

Create `tests/e2e/v2/shell.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile)
    ? authFile
    : { cookies: [], origins: [] },
});

test.describe('v2 shell', () => {
  test.beforeEach(() => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
  });

  test('desktop shell exposes workspace-first navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');

    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Community' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore' })).toHaveCount(0);
    await expect(page.locator('[data-testid="v2-app-shell"]')).toBeVisible();
  });

  test('studio doorway loads without losing existing writing routes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/studio');

    await expect(page.getByRole('heading', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Library' })).toHaveAttribute('href', '/library');
    await expect(page.getByRole('link', { name: 'Start a Book' })).toHaveAttribute('href', '/library/create');
    await expect(page.getByRole('link', { name: 'Writing Hives' })).toHaveAttribute('href', '/hive');
  });

  test('community doorway groups existing social routes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/community');

    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Books' })).toHaveAttribute('href', '/explore/books');
    await expect(page.getByRole('link', { name: 'Clubs' })).toHaveAttribute('href', '/clubs');
    await expect(page.getByRole('link', { name: 'Sparks' })).toHaveAttribute('href', '/sparks');
    await expect(page.getByRole('link', { name: 'Reading Lists' })).toHaveAttribute('href', '/reading-lists');
    await expect(page.getByRole('link', { name: 'Friends' })).toHaveAttribute('href', '/friends');
  });

  test('mobile shell opens a focused drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Community' })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the failing shell tests**

Run:

```bash
npx playwright test tests/e2e/v2/shell.spec.ts --project=chromium --reporter=dot
```

Expected: tests fail because `/studio`, `/community`, `[data-testid="v2-app-shell"]`, and v2 navigation do not exist.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/e2e/v2/shell.spec.ts
git commit -m "test: add v2 shell smoke coverage"
```

---

### Task 2: Add Tactile Paper Design Utilities

**Files:**
- Modify: `app/globals.css`
- Modify: `DESIGN_SYSTEM.md`
- Create: `components/v2/tactile-surface.tsx`

- [ ] **Step 1: Add CSS utilities**

Append this block to `app/globals.css` after the scrollbar utilities:

```css
@utility paper-grit {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.045) 1px, transparent 0),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(0, 0, 0, 0.035));
  background-size: 18px 18px, 100% 100%;
}

@utility paper-stack {
  border: 1px solid #2a2a2a;
  border-bottom-color: #111;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 3px 0 rgba(0, 0, 0, 0.32);
}

@utility paper-stack-hover {
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-duration: 200ms;
  &:hover {
    border-color: rgba(255, 195, 0, 0.35);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.05) inset,
      0 4px 0 rgba(0, 0, 0, 0.38);
    transform: translateY(-1px);
  }
}
```

- [ ] **Step 2: Create the surface component**

Create `components/v2/tactile-surface.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

type TactileSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'aside';
  interactive?: boolean;
  grit?: boolean;
};

export function TactileSurface({
  as = 'div',
  interactive = false,
  grit = false,
  className,
  ...props
}: TactileSurfaceProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        'rounded-xl bg-[#1c1c1c] paper-stack',
        grit && 'paper-grit',
        interactive && 'paper-stack-hover',
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Document the tactile paper rules**

Add this section to `DESIGN_SYSTEM.md` after `## Border Radius`:

```md
## Tactile Paper Surfaces

v2 uses a subtle stacked-paper feel: thin dark cards, a slightly darker bottom edge, and low-contrast texture on selected surfaces.

- Use `paper-stack` on cards, panels, and important buttons that should feel like stacked sheets.
- Use `paper-stack-hover` on clickable cards and panels.
- Use `paper-grit` sparingly on dashboard panels, empty states, and workspace backgrounds.
- Texture must stay low contrast and must never reduce text readability.
- The effect should feel handmade and writerly, not grungy, noisy, or skeuomorphic.
```

- [ ] **Step 4: Run lint/build validation**

Run:

```bash
npm run build
```

Expected: build completes without Tailwind utility errors.

- [ ] **Step 5: Commit design utilities**

```bash
git add app/globals.css DESIGN_SYSTEM.md components/v2/tactile-surface.tsx
git commit -m "feat: add tactile paper design utilities"
```

---

### Task 3: Add V2 Navigation Source of Truth

**Files:**
- Create: `lib/v2/navigation.ts`

- [ ] **Step 1: Create navigation config**

Create `lib/v2/navigation.ts`:

```ts
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
```

- [ ] **Step 2: Run typecheck through build**

Run:

```bash
npm run build
```

Expected: build succeeds and `LucideIcon` imports resolve.

- [ ] **Step 3: Commit navigation config**

```bash
git add lib/v2/navigation.ts
git commit -m "feat: add v2 navigation config"
```

---

### Task 4: Build V2 Desktop and Mobile Navigation

**Files:**
- Create: `components/v2/desktop-nav.tsx`
- Create: `components/v2/mobile-nav.tsx`

- [ ] **Step 1: Create desktop nav**

Create `components/v2/desktop-nav.tsx`:

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { cn } from '@/lib/utils';
import { v2PrimaryNavItems } from '@/lib/v2/navigation';
import logoImage from '@/public/logo3.png';

type V2DesktopNavProps = {
  isAdmin?: boolean;
};

export function V2DesktopNav({ isAdmin = false }: V2DesktopNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const avatarUrl = useCurrentUserImage();
  const username = session?.user?.username ?? undefined;
  const profileHref = `/u/${username ?? session?.user?.id ?? ''}`;

  return (
    <aside className="hidden md:flex h-full w-20 lg:w-72 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#181818] paper-grit">
      <div className="flex h-full flex-col px-3 py-4">
        <Link href="/home" className="mb-6 flex items-center justify-center lg:justify-start lg:px-2">
          <Image src={logoImage} alt="Beehive Books" height={42} width={168} priority className="hidden lg:block" />
          <span className="lg:hidden text-[#FFC300] mainFont text-xl font-bold">BB</span>
        </Link>

        <nav aria-label="Main navigation" className="flex-1">
          <ul className="space-y-2">
            {v2PrimaryNavItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:justify-start',
                      active
                        ? 'bg-[#FFC300] text-black paper-stack'
                        : 'text-white/80 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={cn(
                    'flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:justify-start',
                    pathname.startsWith('/admin')
                      ? 'bg-[#FFC300] text-black paper-stack'
                      : 'text-white/80 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="border-t border-[#2a2a2a] pt-3">
          <Link
            href={profileHref}
            className="mb-2 flex min-h-11 items-center justify-center gap-3 rounded-xl px-2 py-2 text-white/90 hover:bg-white/5 lg:justify-start"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={username ?? 'User'} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-[#FFC300]/20" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC300]/15 text-sm font-bold text-[#FFC300] ring-2 ring-[#FFC300]/20">
                {username?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
            <span className="hidden min-w-0 truncate text-sm font-semibold lg:inline">{username ?? 'Profile'}</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } })}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white lg:justify-start"
          >
            <LogOut aria-hidden="true" className="h-5 w-5" />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create mobile nav**

Create `components/v2/mobile-nav.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v2PrimaryNavItems } from '@/lib/v2/navigation';
import logoImage from '@/public/logo3.png';

type V2MobileNavProps = {
  isAdmin?: boolean;
};

export function V2MobileNav({ isAdmin = false }: V2MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#2a2a2a] bg-[#181818]/95 px-4 backdrop-blur md:hidden">
        <Link href="/home" className="flex items-center">
          <Image src={logoImage} alt="Beehive Books" height={32} width={120} priority />
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="v2-mobile-drawer"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#FFC300] hover:bg-white/5 hover:text-white"
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] transition-opacity md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      <div
        id="v2-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          'fixed right-0 top-0 z-70 flex h-full w-76 max-w-[86vw] flex-col border-l border-[#2a2a2a] bg-[#181818] paper-grit shadow-2xl transition-transform md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-4">
          <Image src={logoImage} alt="Beehive Books" height={32} width={120} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#FFC300] hover:bg-white/5 hover:text-white"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            {v2PrimaryNavItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                      active
                        ? 'bg-[#FFC300] text-black paper-stack'
                        : 'text-white/85 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5 hover:text-white"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds with no client/server boundary errors.

- [ ] **Step 4: Commit navigation components**

```bash
git add components/v2/desktop-nav.tsx components/v2/mobile-nav.tsx
git commit -m "feat: add v2 navigation components"
```

---

### Task 5: Add V2 App Shell and Route Skeletons

**Files:**
- Create: `components/v2/app-shell.tsx`
- Modify: `app/[locale]/(app)/layout.tsx`
- Create: `app/[locale]/(app)/studio/page.tsx`
- Create: `app/[locale]/(app)/community/page.tsx`

- [ ] **Step 1: Create app shell wrapper**

Create `components/v2/app-shell.tsx`:

```tsx
import { V2DesktopNav } from '@/components/v2/desktop-nav';
import { V2MobileNav } from '@/components/v2/mobile-nav';

type V2AppShellProps = {
  children: React.ReactNode;
  isAdmin?: boolean;
};

export function V2AppShell({ children, isAdmin = false }: V2AppShellProps) {
  return (
    <div data-testid="v2-app-shell" className="fixed inset-0 overflow-hidden bg-[#141414]">
      <div className="flex h-full">
        <V2DesktopNav isAdmin={isAdmin} />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pb-4 pt-16 md:px-4 md:py-4">
          <div className="min-h-full w-full rounded-2xl bg-[#1e1e1e] paper-stack paper-grit">
            {children}
          </div>
        </main>
        <V2MobileNav isAdmin={isAdmin} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace authenticated layout shell**

In `app/[locale]/(app)/layout.tsx`, remove these imports:

```tsx
import { DesktopSidebar } from '@/components/nav/desktop-sidebar';
import { MobileNavbar } from '@/components/nav/mobile-navbar';
```

Add this import:

```tsx
import { V2AppShell } from '@/components/v2/app-shell';
```

Replace the authenticated return block:

```tsx
return (
  <div className="fixed inset-0 overflow-hidden bg-[#141414]">
    <div className="flex h-full">
      <DesktopSidebar isAdmin={isAdmin} />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col pt-14 md:pt-3 pb-16 md:pb-3 px-2 md:px-3 mt-2 md:mt-0">
        <div className="flex-1 w-full bg-[#1e1e1e] rounded-2xl animate-in fade-in duration-200">
          {children}
        </div>
      </main>
      <MobileNavbar isAdmin={isAdmin} />
    </div>
  </div>
);
```

with:

```tsx
return <V2AppShell isAdmin={isAdmin}>{children}</V2AppShell>;
```

- [ ] **Step 3: Create Studio doorway**

Create `app/[locale]/(app)/studio/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Create Community doorway**

Create `app/[locale]/(app)/community/page.tsx`:

```tsx
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
              <h2 className="text-lg font-bold text-white mainFont">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
            </Link>
          </TactileSurface>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run shell tests**

Run:

```bash
npx playwright test tests/e2e/v2/shell.spec.ts --project=chromium --reporter=dot
```

Expected: all v2 shell tests pass.

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected: production build succeeds.

- [ ] **Step 7: Commit shell and route skeletons**

```bash
git add -- 'app/[locale]/(app)/layout.tsx' 'app/[locale]/(app)/studio/page.tsx' 'app/[locale]/(app)/community/page.tsx' components/v2/app-shell.tsx
git commit -m "feat: add v2 foundation shell"
```

---

### Task 6: Verify Existing Critical Routes Still Load

**Files:**
- Modify: `tests/e2e/v2/shell.spec.ts`

- [ ] **Step 1: Extend smoke coverage for compatibility routes**

Append this test inside `test.describe('v2 shell', () => { ... })` in `tests/e2e/v2/shell.spec.ts`:

```ts
test('existing library and community routes still load inside v2 shell', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/library');
  await expect(page.locator('[data-testid="v2-app-shell"]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/explore/books');
  await expect(page.locator('[data-testid="v2-app-shell"]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Community' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/hive');
  await expect(page.locator('[data-testid="v2-app-shell"]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Studio' })).toHaveAttribute('aria-current', 'page');
});
```

- [ ] **Step 2: Run the expanded shell tests**

Run:

```bash
npx playwright test tests/e2e/v2/shell.spec.ts --project=chromium --reporter=dot
```

Expected: all v2 shell tests pass.

- [ ] **Step 3: Run existing high-risk smoke tests**

Run:

```bash
npx playwright test tests/e2e/auth/auth.spec.ts tests/e2e/library/books.spec.ts tests/e2e/explore/explore.spec.ts --project=chromium --reporter=dot
```

Expected: tests pass or skip only for documented environment/auth reasons. Any new failure caused by v2 navigation must be fixed before committing.

- [ ] **Step 4: Commit compatibility smoke coverage**

```bash
git add tests/e2e/v2/shell.spec.ts
git commit -m "test: cover v2 shell compatibility routes"
```

---

### Task 7: Final Foundation Verification

**Files:**
- No file changes expected unless verification finds a regression.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 2: Run v2 shell Playwright tests**

Run:

```bash
npx playwright test tests/e2e/v2/shell.spec.ts --project=chromium --reporter=dot
```

Expected: all tests pass.

- [ ] **Step 3: Inspect git status**

Run:

```bash
git status --short
```

Expected: no unstaged implementation changes. Generated Playwright artifacts may be present only if ignored by `.gitignore`.

- [ ] **Step 4: Record implementation notes**

If any existing route required compatibility changes, append a short note to `docs/superpowers/plans/2026-05-03-v2-foundation-shell-plan.md` under this section:

```md
## Implementation Notes

- No compatibility exceptions were required for the foundation shell.
```

If exceptions were required, replace the bullet with the exact file and reason.

- [ ] **Step 5: Commit implementation notes if changed**

```bash
git add docs/superpowers/plans/2026-05-03-v2-foundation-shell-plan.md
git commit -m "docs: record v2 shell implementation notes"
```

## Self-Review

Spec coverage:

- Product thesis: covered by workspace-first nav and Studio/Community split.
- Architecture: covered by v2 shell, nav config, route skeletons, and no schema changes.
- Navigation model: covered by v2 nav config and Playwright assertions.
- Home: not implemented in this plan; it will be handled by the adaptive Home command center plan after shell foundation.
- Project workspace: not implemented in this plan; it will be handled by the adaptive project workspace plan.
- Community and discovery: partially covered by Community doorway and route grouping.
- Visual design: covered by tactile paper utilities and `DESIGN_SYSTEM.md` update.
- Mobile UX: covered by v2 mobile drawer smoke test.
- Data/schema: covered by explicit no-schema-change scope.
- Import/repair: not implemented in this plan; it will be handled by the import/repair plan.
- Testing/CI: covered by Playwright shell tests; CI remains a later plan.
- Optimization/operations: partially covered by server-friendly shell boundaries; detailed performance/ops remain a later plan.
- Monetization: not implemented in this plan; it will be handled by Plus entitlements/ads plan.
- Rollout: this plan implements rollout item 1 foundation work.

Placeholder scan:

- The plan contains no placeholder markers or undefined function references.
- Future subsystem plans are named in the plan set, and each is explicitly out of scope for this foundation plan.

Type consistency:

- `V2NavItem`, `v2PrimaryNavItems`, `V2AppShell`, `V2DesktopNav`, `V2MobileNav`, and `TactileSurface` names are consistent across tasks.

## Implementation Notes

- No compatibility exceptions were required for the foundation shell.
