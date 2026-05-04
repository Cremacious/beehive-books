# V2 Adaptive Project Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/write/[bookId]` route with a v2 author workspace that adapts between planning-first and drafting-first states while preserving the existing book/chapter schema and v1 library flows.

**Architecture:** Keep the existing schema and server actions as the source of truth. Add pure v2 workspace helpers, focused workspace UI components, and route-level composition that calls `getBookWithChaptersAction(bookId)`. The workspace links into existing create/edit/read routes rather than rebuilding the editor in this slice.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS utilities, lucide-react, existing Drizzle/Neon schema, Playwright E2E tests.

---

## Scope And Data Rules

- No schema changes.
- No data migration.
- `/library/[bookId]` remains the reader/library detail route.
- `/write/[bookId]` becomes the owner-only v2 project workspace.
- Existing chapter create/edit/read routes remain under `/library/[bookId]/...` for this slice.
- The workspace chooses its initial emphasis from existing data:
  - `plan` when the book has no chapters and no words.
  - `draft` when the book has any chapter or word count.
- This slice adds launch-ready doorway panels for planning, collaboration, publishing, and export. It does not add durable outline/worldbuilding tables yet.

## File Structure

- Create `lib/v2/workspace.ts`
  - Pure helper functions and types for workspace mode, stats, latest chapter, status labels, and date formatting.
- Create `components/v2/workspace/workspace-action-link.tsx`
  - Small reusable tactile link card for workspace actions.
- Create `components/v2/workspace/project-workspace-shell.tsx`
  - Server-compatible presentational component for the complete `/write/[bookId]` workspace.
- Modify `app/[locale]/(app)/write/[bookId]/page.tsx`
  - Replace placeholder with owner-only data load and workspace render.
- Modify `app/[locale]/(app)/write/page.tsx`
  - Replace placeholder dashboard with a clear studio/library bridge.
- Modify `app/[locale]/(app)/library/[bookId]/page.tsx`
  - Add an owner "Open Studio" action linking to `/write/[bookId]`.
- Create `tests/e2e/v2/workspace.spec.ts`
  - Playwright coverage for empty workspace, draft workspace, library studio entry, and mobile overflow.

---

### Task 1: Add Workspace E2E Coverage

**Files:**
- Create: `tests/e2e/v2/workspace.spec.ts`

- [ ] **Step 1: Create the failing Playwright spec**

Add this file:

```ts
import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile)
    ? authFile
    : { cookies: [], origins: [] },
});

const runId = Date.now();

async function fillBookForm(page: Page, title: string) {
  await page.locator('input[placeholder^="Enter your book title"]').fill(title);
  await page.locator('input[placeholder^="Your pen name or real name"]').fill('Workspace Tester');
  await page.locator('select[name="category"]').selectOption('Fiction');
  await page.locator('select[name="genre"]').selectOption('Fantasy');
  await page
    .locator('textarea[placeholder^="Write a compelling description of your book"]')
    .fill('A temporary book created by the v2 workspace Playwright suite.');
}

async function createBook(page: Page, title: string) {
  await page.goto('/library/create');
  await fillBookForm(page, title);
  await page.getByRole('button', { name: 'Create Book' }).click();

  const errorLocator = page.locator('p.text-red-400');
  const result = await Promise.race([
    page.waitForURL('/library', { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'created' as const),
    errorLocator.waitFor({ state: 'visible', timeout: 75_000 }).then(() => 'error' as const),
    page.waitForURL(/\/sign-in/, { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'unauthenticated' as const),
  ]);

  if (result === 'unauthenticated') {
    test.fail(true, 'Session expired. Re-run auth setup.');
    throw new Error('Unauthenticated test session');
  }

  if (result === 'error') {
    const msg = await errorLocator.textContent();
    test.skip(true, `Book creation blocked by server: "${msg}". Delete leftover [E2E] books and re-run.`);
  }

  await page.getByText(title).first().click();
  await page.waitForURL(/\/library\/[a-z0-9]+$/, { waitUntil: 'domcontentloaded' });
  return page.url().split('/').pop()!;
}

async function createChapter(page: Page, bookId: string, title: string) {
  await page.goto(`/library/${bookId}/create-chapter`);
  await page.locator('input[placeholder^="Enter your chapter title"]').fill(title);
  await page.locator('.ProseMirror').fill('The first chapter opens with enough words to prove the draft workspace is active.');
  await page.getByRole('button', { name: 'Create Chapter' }).click();
  await page.waitForURL(new RegExp(`/library/${bookId}/[a-z0-9]+$`), {
    waitUntil: 'domcontentloaded',
  });
}

test.describe('v2 adaptive project workspace', () => {
  test.beforeEach(() => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
  });

  test('empty project opens in planning mode with first chapter action', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Empty ${runId}`;
    const bookId = await createBook(page, bookTitle);

    await page.goto(`/write/${bookId}`);

    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
    await expect(page.getByText('Plan first')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Write first chapter' })).toHaveAttribute(
      'href',
      `/library/${bookId}/create-chapter`,
    );
    await expect(page.getByText('0 chapters')).toBeVisible();
  });

  test('project with chapters opens in drafting mode with continue action', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Draft ${runId}`;
    const chapterTitle = `[E2E] Opening Chapter ${runId}`;
    const bookId = await createBook(page, bookTitle);
    await createChapter(page, bookId, chapterTitle);

    await page.goto(`/write/${bookId}`);

    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
    await expect(page.getByText('Draft first')).toBeVisible();
    await expect(page.getByText(chapterTitle)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue writing' })).toHaveAttribute(
      'href',
      new RegExp(`/library/${bookId}/[a-z0-9]+/edit`),
    );
  });

  test('library owner detail exposes Open Studio route', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Link ${runId}`;
    const bookId = await createBook(page, bookTitle);

    await page.goto(`/library/${bookId}`);

    await expect(page.getByRole('link', { name: 'Open Studio' }).first()).toHaveAttribute(
      'href',
      `/write/${bookId}`,
    );
  });

  test('workspace has no mobile horizontal overflow', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Mobile ${runId}`;
    const bookId = await createBook(page, bookTitle);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/write/${bookId}`);

    await expect(page.locator('[data-testid="v2-project-workspace"]')).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });
});
```

- [ ] **Step 2: Run the new spec and verify it fails for missing UI**

Run:

```bash
npx playwright test tests/e2e/v2/workspace.spec.ts --project=chromium --reporter=dot
```

Expected: failures mention missing `Plan first`, missing `Draft first`, missing `Open Studio`, or missing `data-testid="v2-project-workspace"`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/e2e/v2/workspace.spec.ts
git commit -m "test: cover v2 project workspace"
```

---

### Task 2: Add Pure Workspace Helpers

**Files:**
- Create: `lib/v2/workspace.ts`

- [ ] **Step 1: Add workspace helper module**

Create `lib/v2/workspace.ts`:

```ts
import type { Chapter, DraftStatus } from '@/lib/types/books.types';
import { DRAFT_STATUS_LABELS } from '@/lib/types/books.types';

export type WorkspaceMode = 'plan' | 'draft';

export type WorkspaceBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  category: string;
  description: string;
  privacy: string;
  draftStatus: DraftStatus;
  publishingStatus?: string;
  wordCount: number;
  chapterCount: number;
  commentCount: number;
  updatedAt?: Date;
  chapters: Chapter[];
  collections: { id: string; name: string; order: number }[];
};

export function getAdaptiveWorkspaceMode(book: Pick<WorkspaceBook, 'chapterCount' | 'wordCount' | 'chapters'>): WorkspaceMode {
  if (book.chapterCount > 0 || book.wordCount > 0 || book.chapters.length > 0) {
    return 'draft';
  }

  return 'plan';
}

export function getLatestChapter(chapters: Chapter[]) {
  return [...chapters].sort((a, b) => b.order - a.order)[0] ?? null;
}

export function getWorkspaceStats(book: Pick<WorkspaceBook, 'chapterCount' | 'wordCount' | 'commentCount' | 'collections'>) {
  return [
    { label: 'chapters', value: book.chapterCount },
    { label: 'words', value: book.wordCount },
    { label: 'collections', value: book.collections.length },
    { label: 'comments', value: book.commentCount },
  ];
}

export function getDraftStatusLabel(status: DraftStatus) {
  return DRAFT_STATUS_LABELS[status] ?? 'Draft';
}

export function getPublishingStatusLabel(status?: string) {
  switch (status) {
    case 'self_published':
      return 'Self published';
    case 'submitted':
      return 'Submitted';
    case 'published':
      return 'Published';
    default:
      return 'Private draft';
  }
}

export function formatWorkspaceDate(date?: Date) {
  if (!date) return 'Not updated yet';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
```

- [ ] **Step 2: Run TypeScript/build check**

Run:

```bash
npm run build
```

Expected: build passes or fails only because later tasks have not added consumers. If TypeScript fails in this new file, fix the exact error before continuing.

- [ ] **Step 3: Commit helpers**

```bash
git add lib/v2/workspace.ts
git commit -m "feat: add v2 workspace helpers"
```

---

### Task 3: Build Workspace Components

**Files:**
- Create: `components/v2/workspace/workspace-action-link.tsx`
- Create: `components/v2/workspace/project-workspace-shell.tsx`

- [ ] **Step 1: Add tactile action link component**

Create `components/v2/workspace/workspace-action-link.tsx`:

```tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';

type WorkspaceActionLinkProps = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
};

export function WorkspaceActionLink({
  href,
  label,
  description,
  icon: Icon,
  primary = false,
}: WorkspaceActionLinkProps) {
  return (
    <TactileSurface
      as="article"
      interactive
      className={primary ? 'border-[#FFC300]/40 bg-[#24210f] p-4' : 'p-4'}
    >
      <Link href={href} className="group flex h-full gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/12 text-[#FFC300]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3 text-sm font-bold text-white mainFont">
            {label}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[#FFC300]"
            />
          </span>
          <span className="mt-1 block text-sm leading-5 text-white/65">{description}</span>
        </span>
      </Link>
    </TactileSurface>
  );
}
```

- [ ] **Step 2: Add project workspace shell**

Create `components/v2/workspace/project-workspace-shell.tsx`:

```tsx
import Link from 'next/link';
import {
  BookOpen,
  Boxes,
  FileDown,
  FileText,
  FolderOpen,
  MessageSquare,
  PencilLine,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';
import type { WorkspaceBook } from '@/lib/v2/workspace';
import {
  formatWorkspaceDate,
  getAdaptiveWorkspaceMode,
  getDraftStatusLabel,
  getLatestChapter,
  getPublishingStatusLabel,
  getWorkspaceStats,
} from '@/lib/v2/workspace';
import { WorkspaceActionLink } from './workspace-action-link';

type ProjectWorkspaceShellProps = {
  book: WorkspaceBook;
};

export function ProjectWorkspaceShell({ book }: ProjectWorkspaceShellProps) {
  const mode = getAdaptiveWorkspaceMode(book);
  const latestChapter = getLatestChapter(book.chapters);
  const stats = getWorkspaceStats(book);
  const primaryHref = latestChapter
    ? `/library/${book.id}/${latestChapter.id}/edit`
    : `/library/${book.id}/create-chapter`;

  return (
    <div
      data-testid="v2-project-workspace"
      className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8"
    >
      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <TactileSurface as="section" grit className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#FFC300] mainFont">Project workspace</p>
              <h1 className="mt-2 break-words text-2xl font-bold text-white mainFont md:text-3xl">
                {book.title}
              </h1>
              <p className="mt-2 text-sm text-white/70">by {book.author}</p>
            </div>
            <span className="rounded-full border border-[#FFC300]/25 bg-[#FFC300]/10 px-3 py-1 text-xs font-bold text-[#FFC300]">
              {mode === 'draft' ? 'Draft first' : 'Plan first'}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/8 bg-black/18 p-3">
                <p className="text-xl font-bold text-white mainFont">{stat.value.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-wide text-white/45">{stat.label}</p>
              </div>
            ))}
          </div>
        </TactileSurface>

        <TactileSurface as="aside" className="p-5">
          <p className="text-sm font-bold text-white mainFont">Status</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Draft</dt>
              <dd className="text-right text-white">{getDraftStatusLabel(book.draftStatus)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Publishing</dt>
              <dd className="text-right text-white">{getPublishingStatusLabel(book.publishingStatus)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Updated</dt>
              <dd className="text-right text-white">{formatWorkspaceDate(book.updatedAt)}</dd>
            </div>
          </dl>
        </TactileSurface>
      </header>

      <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-5">
          <TactileSurface as="section" grit className="p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#FFC300] mainFont">
                  {mode === 'draft' ? 'Draft desk' : 'Planning desk'}
                </p>
                <h2 className="mt-1 text-xl font-bold text-white mainFont">
                  {mode === 'draft' ? 'Keep the manuscript moving' : 'Shape the book before chapter one'}
                </h2>
              </div>
              <Link
                href={primaryHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FFC300]/30 bg-[#FFC300] px-4 py-2 text-sm font-bold text-black shadow-[0_3px_0_#8f6d00]"
              >
                <PencilLine aria-hidden="true" className="h-4 w-4" />
                {latestChapter ? 'Continue writing' : 'Write first chapter'}
              </Link>
            </div>

            {latestChapter ? (
              <div className="mt-5 rounded-xl border border-white/8 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-wide text-white/45">Latest chapter</p>
                <h3 className="mt-2 break-words text-lg font-bold text-white mainFont">{latestChapter.title}</h3>
                <p className="mt-1 text-sm text-white/65">{latestChapter.wordCount.toLocaleString()} words</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-[#FFC300]/30 bg-[#FFC300]/8 p-4">
                <p className="text-sm leading-6 text-white/75">
                  Start with a working chapter, then use this workspace as the command center for planning,
                  collaboration, publishing, and export.
                </p>
              </div>
            )}
          </TactileSurface>

          <div className="grid gap-4 md:grid-cols-2">
            <WorkspaceActionLink
              href={`/library/${book.id}/create-chapter`}
              label={latestChapter ? 'New chapter' : 'Write first chapter'}
              description="Use the existing editor and chapter save flow."
              icon={FileText}
              primary={!latestChapter}
            />
            <WorkspaceActionLink
              href={`/library/${book.id}`}
              label="Table of contents"
              description="Reorder chapters, organize collections, and review the reader view."
              icon={FolderOpen}
            />
            <WorkspaceActionLink
              href={`/library/${book.id}/edit`}
              label="Book settings"
              description="Edit metadata, privacy, tags, comments, cover, and draft status."
              icon={BookOpen}
            />
            <WorkspaceActionLink
              href="/hive"
              label="Collaborate"
              description="Bring the project into writing hives while workspace-native collaboration is phased in."
              icon={Users}
            />
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <TactileSurface as="section" className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-[#FFC300]" />
              <h2 className="text-base font-bold text-white mainFont">Planning</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Outline, worldbuilding, character boards, and import repair belong here next. For this slice,
              the workspace creates the stable home for those tools.
            </p>
          </TactileSurface>

          <TactileSurface as="section" className="p-5">
            <div className="flex items-center gap-2">
              <Share2 aria-hidden="true" className="h-4 w-4 text-[#FFC300]" />
              <h2 className="text-base font-bold text-white mainFont">Launch path</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <WorkspaceActionLink
                href={`/library/${book.id}`}
                label="Community preview"
                description="Check what readers see before sharing."
                icon={MessageSquare}
              />
              <WorkspaceActionLink
                href={`/library/${book.id}/edit`}
                label="Publish controls"
                description="Manage privacy and discoverability with existing settings."
                icon={Boxes}
              />
              <WorkspaceActionLink
                href={`/library/${book.id}`}
                label="Export doorway"
                description="Export remains a Plus feature target; this doorway reserves the workflow."
                icon={FileDown}
              />
            </div>
          </TactileSurface>
        </aside>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Run TypeScript/build check**

Run:

```bash
npm run build
```

Expected: build fails only if import/type details need correction. Fix any TypeScript errors in the two new component files before moving on.

- [ ] **Step 4: Commit components**

```bash
git add components/v2/workspace/workspace-action-link.tsx components/v2/workspace/project-workspace-shell.tsx
git commit -m "feat: add v2 project workspace UI"
```

---

### Task 4: Wire Workspace Routes And Library Entry

**Files:**
- Modify: `app/[locale]/(app)/write/[bookId]/page.tsx`
- Modify: `app/[locale]/(app)/write/page.tsx`
- Modify: `app/[locale]/(app)/library/[bookId]/page.tsx`

- [ ] **Step 1: Replace `/write/[bookId]` placeholder**

Replace the whole contents of `app/[locale]/(app)/write/[bookId]/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectWorkspaceShell } from '@/components/v2/workspace/project-workspace-shell';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export const metadata: Metadata = {
  title: 'Project Workspace',
  description: 'Plan, draft, collaborate, publish, and export your book on Beehive Books.',
};

export default async function ManageBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book;
  try {
    book = await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  return <ProjectWorkspaceShell book={book} />;
}
```

- [ ] **Step 2: Replace `/write` placeholder**

Replace the whole contents of `app/[locale]/(app)/write/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Library, Plus } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';

export const metadata: Metadata = {
  title: 'Write',
  description: 'Your writing dashboard on Beehive Books.',
};

export default function WriteDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-[#FFC300] mainFont">Write</p>
        <h1 className="mt-2 text-2xl font-bold text-white mainFont">Choose a project</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Open a book from your library to enter its v2 project workspace.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <TactileSurface as="article" interactive className="p-5">
          <Link href="/library" className="block">
            <Library aria-hidden="true" className="mb-4 h-6 w-6 text-[#FFC300]" />
            <h2 className="text-lg font-bold text-white mainFont">Open library</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Pick an existing book and use Open Studio to continue.
            </p>
          </Link>
        </TactileSurface>
        <TactileSurface as="article" interactive className="p-5">
          <Link href="/library/create" className="block">
            <Plus aria-hidden="true" className="mb-4 h-6 w-6 text-[#FFC300]" />
            <h2 className="text-lg font-bold text-white mainFont">Start a book</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Create a project using the existing book schema.
            </p>
          </Link>
        </TactileSurface>
      </div>

      <TactileSurface as="section" grit className="p-5">
        <div className="flex items-start gap-3">
          <BookOpen aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#FFC300]" />
          <p className="text-sm leading-6 text-white/70">
            The full command center lives on each project at <span className="text-white">/write/[bookId]</span>.
          </p>
        </div>
      </TactileSurface>
    </div>
  );
}
```

- [ ] **Step 3: Add owner Open Studio link to library detail**

In `app/[locale]/(app)/library/[bookId]/page.tsx`, update the icon import:

```tsx
import { Edit, BookOpen, FileText, MessageSquare, Globe, Lock, LayoutDashboard } from 'lucide-react';
```

In the desktop owner actions, add this link before the existing Edit link:

```tsx
<Link
  href={`/write/${book.id}`}
  className="flex items-center gap-1.5 rounded-xl border border-[#FFC300]/25 bg-[#FFC300] px-4 py-2 text-sm font-bold text-black shadow-[0_3px_0_#8f6d00] transition-colors hover:bg-[#FFD040]"
>
  <LayoutDashboard className="w-4 h-4" />
  Open Studio
</Link>
```

In the mobile owner actions, add this link before the existing Edit Book link:

```tsx
<Link
  href={`/write/${book.id}`}
  className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#FFC300] text-black text-sm font-bold transition-colors hover:bg-[#FFD040]"
>
  <LayoutDashboard className="w-4 h-4" />
  Open Studio
</Link>
```

Change the existing mobile Edit Book link to a quieter outline style so the primary action is not duplicated:

```tsx
className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-[#2a2a2a] text-white text-sm font-bold transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
```

- [ ] **Step 4: Run focused workspace tests**

Run:

```bash
npx playwright test tests/e2e/v2/workspace.spec.ts --project=chromium --reporter=dot
```

Expected: all workspace tests pass or skip only when auth/test account setup blocks book creation.

- [ ] **Step 5: Commit route wiring**

```bash
git add app/[locale]/(app)/write/[bookId]/page.tsx app/[locale]/(app)/write/page.tsx app/[locale]/(app)/library/[bookId]/page.tsx
git commit -m "feat: wire v2 project workspace routes"
```

---

### Task 5: Verify Existing Shell And Library Flows

**Files:**
- No planned source changes unless verification exposes a regression.

- [ ] **Step 1: Run v2 shell tests**

Run:

```bash
npx playwright test tests/e2e/v2/shell.spec.ts --project=chromium --reporter=dot
```

Expected: pass. If the `/write` doorway wording changes a shell expectation, update only the expectation that describes the stable route behavior.

- [ ] **Step 2: Run chapter smoke tests**

Run:

```bash
npx playwright test tests/e2e/library/chapters.spec.ts --project=chromium --reporter=dot
```

Expected: pass, skip only for known auth/server setup reasons. This protects create/edit/chapter navigation because the workspace links into those routes.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: build passes. The existing middleware deprecation warning may still appear; do not treat it as a failure in this slice.

- [ ] **Step 4: Commit any test expectation-only fixes**

Only if Step 1 or Step 2 required expectation updates:

```bash
git add tests/e2e/v2/shell.spec.ts tests/e2e/library/chapters.spec.ts
git commit -m "test: align workspace route expectations"
```

---

### Task 6: Final Review And Handoff

**Files:**
- Read-only review unless a bug is found.

- [ ] **Step 1: Inspect changed files**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: working tree is clean and recent commits are the test, helper, UI, and route commits.

- [ ] **Step 2: Manually inspect workspace in browser**

Start dev server if it is not already running:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/write/[bookId]
```

Check:

- Empty books show `Plan first`.
- Books with chapters show `Draft first`.
- The primary button never wraps awkwardly on mobile.
- The workspace keeps the dark gray/black/yellow/white palette.
- Tactile stacked-paper borders are visible.
- There is no horizontal scroll at 390px width.

- [ ] **Step 3: Prepare final implementation summary**

Include:

- Files changed.
- Tests run and exact pass/fail/skip result.
- Confirmation that no schema migration was added.
- Note that durable planning/import/export data structures are intentionally deferred to later v2 slices.

---

## Self-Review

**Spec coverage:** This plan implements the next practical v2 slice from the overhaul spec: writer-first project workspace, balanced command surface, tactile visual language, existing data preservation, and Playwright-first coverage. It keeps community/discovery present through links without making social the center.

**Known deferrals:** Native outline/worldbuilding storage, robust import repair, monetization gates, ad removal, export generation, and real co-editing are not implemented here. They are later slices from the plan set.

**Placeholder scan:** The plan does not use open-ended implementation placeholders. The only deferred items are explicitly named as future product slices and not required for this workspace slice.

**Type consistency:** `WorkspaceBook` is shaped to match `getBookWithChaptersAction(bookId)` plus existing `books` schema fields. `ProjectWorkspaceShell` consumes the helper names exactly as defined in `lib/v2/workspace.ts`.
