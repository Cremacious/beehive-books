# V2 Import Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a schema-preserving manuscript import review flow that detects suspicious chapter parsing before user text is saved into Beehive chapters.

**Architecture:** Move manuscript splitting and warning heuristics into pure domain helpers, then expose them through server actions and a v2 workspace import route. The first slice supports pasted/plain text plus `.docx`/`.txt` upload preview and saves confirmed chapters through the existing `createChapterAction` path so book/chapter counters, free limits, milestones, and user data behavior remain intact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node test runner via `tsx --test`, Playwright, existing `mammoth` DOCX dependency, existing book/chapter server actions.

---

## Scope And Data Rules

- No schema changes.
- No destructive repair of existing chapters in this slice.
- No automatic save after parsing. Users review and confirm first.
- EPUB import cleanup is deferred; this slice creates the shared parser/review pattern that EPUB can move onto later.
- Existing single-chapter DOCX upload in `ChapterForm` remains available.
- Existing book-create DOCX/EPUB import remains available for now, but the workspace points users to the safer v2 import flow.

## File Structure

- Create `lib/import/manuscript.ts`
  - Pure parsing, HTML escaping, heading detection, title/content normalization, suspicious-result analysis.
- Create `tests/unit/import/manuscript.test.ts`
  - Fixture-style tests using Node's built-in test runner through `tsx --test`.
- Create `lib/actions/import.actions.ts`
  - Server actions to parse uploaded/pasted manuscripts and save reviewed chapters to an existing book.
- Create `components/v2/import/import-review-client.tsx`
  - Client review UI for upload/paste, warning display, editable chapter cards, remove/merge/split-lite controls, and confirm save.
- Create `app/[locale]/(app)/write/[bookId]/import/page.tsx`
  - Owner-scoped server page that renders the import review client.
- Modify `components/v2/workspace/project-workspace-shell.tsx`
  - Add an `Import manuscript` action link to `/write/[bookId]/import`.
- Create `tests/e2e/v2/import.spec.ts`
  - Playwright coverage for text import review, suspicious title warning, edit-before-save, and workspace link.

---

### Task 1: Add Parser Unit Tests

**Files:**
- Create: `tests/unit/import/manuscript.test.ts`

- [ ] **Step 1: Create the failing parser test file**

Create `tests/unit/import/manuscript.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeImportChapters,
  parseHtmlManuscript,
  parsePlainTextManuscript,
} from '@/lib/import/manuscript';

test('plain text parser splits common chapter headings and keeps body text out of titles', () => {
  const result = parsePlainTextManuscript(`
Chapter 1
The first real paragraph belongs in the body.

Chapter 2: The Door
Second body paragraph.
`);

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'Chapter 1');
  assert.match(result.chapters[0].content, /first real paragraph/);
  assert.equal(result.chapters[1].title, 'Chapter 2: The Door');
  assert.match(result.chapters[1].content, /Second body paragraph/);
});

test('plain text parser supports public-domain roman numeral headings', () => {
  const result = parsePlainTextManuscript(`
CHAPTER I.
Down the Rabbit-Hole

Alice was beginning to get very tired.

CHAPTER II
The Pool of Tears

Curiouser and curiouser.
`);

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'CHAPTER I. Down the Rabbit-Hole');
  assert.match(result.chapters[0].content, /Alice was beginning/);
  assert.equal(result.chapters[1].title, 'CHAPTER II The Pool of Tears');
});

test('parser falls back to one chapter when no heading exists', () => {
  const result = parsePlainTextManuscript('A loose scene with no heading.');

  assert.equal(result.chapters.length, 1);
  assert.equal(result.chapters[0].title, 'Imported manuscript');
  assert.match(result.chapters[0].content, /loose scene/);
});

test('html parser splits h1 and h2 headings', () => {
  const result = parseHtmlManuscript('<h1>One</h1><p>Body one.</p><h2>Two</h2><p>Body two.</p>');

  assert.equal(result.chapters.length, 2);
  assert.equal(result.chapters[0].title, 'One');
  assert.equal(result.chapters[0].content, '<p>Body one.</p>');
  assert.equal(result.chapters[1].title, 'Two');
});

test('analysis flags suspicious titles and empty chapters', () => {
  const warnings = analyzeImportChapters([
    {
      id: 'a',
      title: 'Chapter One ' + 'word '.repeat(35),
      content: '',
      sourceIndex: 0,
      warnings: [],
    },
  ]);

  assert.equal(warnings.length, 2);
  assert.equal(warnings[0].code, 'long-title');
  assert.equal(warnings[1].code, 'empty-content');
});
```

- [ ] **Step 2: Run the failing unit tests**

Run:

```bash
npx tsx --test tests/unit/import/manuscript.test.ts
```

Expected: fail because `@/lib/import/manuscript` does not exist.

- [ ] **Step 3: Commit failing tests**

```bash
git add tests/unit/import/manuscript.test.ts
git commit -m "test: cover manuscript import parser"
```

---

### Task 2: Implement Pure Manuscript Parser

**Files:**
- Create: `lib/import/manuscript.ts`

- [ ] **Step 1: Add parser implementation**

Create `lib/import/manuscript.ts`:

```ts
export type ImportWarningCode =
  | 'long-title'
  | 'empty-content'
  | 'duplicate-title'
  | 'large-content'
  | 'fallback-title';

export type ImportWarning = {
  code: ImportWarningCode;
  chapterId: string;
  message: string;
};

export type ImportChapterDraft = {
  id: string;
  title: string;
  content: string;
  sourceIndex: number;
  warnings: ImportWarningCode[];
};

export type ImportParseResult = {
  chapters: ImportChapterDraft[];
  warnings: ImportWarning[];
  sourceFormat: 'text' | 'html';
};

const MAX_TITLE_LENGTH = 100;
const LONG_TITLE_WORDS = 18;
const LARGE_CONTENT_WORDS = 12000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function makeId(index: number) {
  return `import-chapter-${index + 1}`;
}

function paragraphsToHtml(lines: string[]) {
  return lines
    .join('\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function isChapterHeading(line: string) {
  return /^(chapter|book|part)\s+([0-9]+|[ivxlcdm]+)([\s.:;-].*)?$/i.test(line.trim());
}

function createDraft(title: string, bodyLines: string[], sourceIndex: number): ImportChapterDraft {
  const normalizedTitle = title.trim().replace(/\s+/g, ' ') || `Chapter ${sourceIndex + 1}`;

  return {
    id: makeId(sourceIndex),
    title: normalizedTitle.slice(0, MAX_TITLE_LENGTH),
    content: paragraphsToHtml(bodyLines),
    sourceIndex,
    warnings: [],
  };
}

export function parsePlainTextManuscript(text: string): ImportParseResult {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const chapters: ImportChapterDraft[] = [];
  let pendingTitle = '';
  let bodyLines: string[] = [];
  let sourceIndex = 0;

  function flush() {
    if (!pendingTitle && bodyLines.every((line) => !line.trim())) return;
    chapters.push(createDraft(pendingTitle || 'Imported manuscript', bodyLines, sourceIndex));
    sourceIndex += 1;
    pendingTitle = '';
    bodyLines = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i].trim();
    const next = lines[i + 1]?.trim() ?? '';

    if (isChapterHeading(current)) {
      flush();
      pendingTitle = next && !isChapterHeading(next) && next.length <= 80
        ? `${current} ${next}`.trim()
        : current;
      if (pendingTitle.endsWith(next)) i += 1;
      continue;
    }

    bodyLines.push(lines[i]);
  }

  flush();

  if (chapters.length === 0) {
    chapters.push(createDraft('Imported manuscript', [text], 0));
  }

  const warnings = analyzeImportChapters(chapters);
  return {
    chapters: chapters.map((chapter) => ({
      ...chapter,
      warnings: warnings
        .filter((warning) => warning.chapterId === chapter.id)
        .map((warning) => warning.code),
    })),
    warnings,
    sourceFormat: 'text',
  };
}

export function parseHtmlManuscript(html: string): ImportParseResult {
  const headingPattern = /<h[1-2][^>]*>[\s\S]*?<\/h[1-2]>/gi;
  const matches = [...html.matchAll(headingPattern)];

  if (matches.length === 0) {
    const text = stripTags(html);
    return parsePlainTextManuscript(text);
  }

  const chapters = matches.map((match, index) => {
    const headingStart = match.index ?? 0;
    const headingEnd = headingStart + match[0].length;
    const nextStart = matches[index + 1]?.index ?? html.length;
    const title = stripTags(match[0]);
    const content = html.slice(headingEnd, nextStart).trim();

    return {
      id: makeId(index),
      title: title.slice(0, MAX_TITLE_LENGTH),
      content,
      sourceIndex: index,
      warnings: [],
    };
  });

  const warnings = analyzeImportChapters(chapters);
  return {
    chapters: chapters.map((chapter) => ({
      ...chapter,
      warnings: warnings
        .filter((warning) => warning.chapterId === chapter.id)
        .map((warning) => warning.code),
    })),
    warnings,
    sourceFormat: 'html',
  };
}

export function analyzeImportChapters(chapters: ImportChapterDraft[]): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  const seenTitles = new Map<string, string>();

  for (const chapter of chapters) {
    const titleWords = chapter.title.split(/\s+/).filter(Boolean).length;
    const contentWords = stripTags(chapter.content).split(/\s+/).filter(Boolean).length;
    const titleKey = chapter.title.toLowerCase();

    if (chapter.title.length >= MAX_TITLE_LENGTH || titleWords > LONG_TITLE_WORDS) {
      warnings.push({
        code: 'long-title',
        chapterId: chapter.id,
        message: 'This chapter title is unusually long. Check that body text did not land in the title.',
      });
    }

    if (contentWords === 0) {
      warnings.push({
        code: 'empty-content',
        chapterId: chapter.id,
        message: 'This chapter has no body content.',
      });
    }

    if (contentWords > LARGE_CONTENT_WORDS) {
      warnings.push({
        code: 'large-content',
        chapterId: chapter.id,
        message: 'This chapter is very large. Check whether multiple chapters should be split apart.',
      });
    }

    if (chapter.title === 'Imported manuscript') {
      warnings.push({
        code: 'fallback-title',
        chapterId: chapter.id,
        message: 'No chapter headings were detected. Review the imported chapter before saving.',
      });
    }

    if (seenTitles.has(titleKey)) {
      warnings.push({
        code: 'duplicate-title',
        chapterId: chapter.id,
        message: `This title duplicates ${seenTitles.get(titleKey)}.`,
      });
    } else {
      seenTitles.set(titleKey, chapter.title);
    }
  }

  return warnings;
}
```

- [ ] **Step 2: Run parser unit tests**

Run:

```bash
npx tsx --test tests/unit/import/manuscript.test.ts
```

Expected: pass.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: pass with only known middleware warning.

- [ ] **Step 4: Commit parser**

```bash
git add lib/import/manuscript.ts
git commit -m "feat: add manuscript import parser"
```

---

### Task 3: Add Import Server Actions

**Files:**
- Create: `lib/actions/import.actions.ts`
- Modify: `lib/actions/docx.actions.ts`

- [ ] **Step 1: Export DOCX HTML conversion helper**

In `lib/actions/docx.actions.ts`, add this exported helper above `parseDocxAction`:

```ts
export async function convertDocxFileToHtml(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
  return result.value;
}
```

Replace both duplicated Mammoth conversion blocks in `parseDocxAction` and `parseSingleChapterDocxAction` with:

```ts
const html = await convertDocxFileToHtml(file);
```

- [ ] **Step 2: Create import actions**

Create `lib/actions/import.actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { getBookWithChaptersAction, createChapterAction } from '@/lib/actions/book.actions';
import { convertDocxFileToHtml } from '@/lib/actions/docx.actions';
import {
  parseHtmlManuscript,
  parsePlainTextManuscript,
  type ImportChapterDraft,
  type ImportParseResult,
} from '@/lib/import/manuscript';

export type ParseManuscriptResult =
  | { success: true; result: ImportParseResult }
  | { success: false; message: string };

export type SaveImportResult =
  | { success: true; createdCount: number }
  | { success: false; message: string };

function sanitizeReviewedChapters(raw: unknown): ImportChapterDraft[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    const content = typeof record.content === 'string' ? record.content.trim() : '';
    if (!title || !content) return [];

    return [{
      id: typeof record.id === 'string' ? record.id : `reviewed-${index + 1}`,
      title: title.slice(0, 100),
      content,
      sourceIndex: index,
      warnings: [],
    }];
  });
}

export async function parseManuscriptImportAction(formData: FormData): Promise<ParseManuscriptResult> {
  const bookId = String(formData.get('bookId') ?? '');
  await getBookWithChaptersAction(bookId);

  const pastedText = String(formData.get('text') ?? '').trim();
  const file = formData.get('file');

  if (file instanceof File && file.size > 0) {
    const lowerName = file.name.toLowerCase();

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: 'File is too large (max 10 MB).' };
    }

    if (lowerName.endsWith('.docx')) {
      try {
        const html = await convertDocxFileToHtml(file);
        if (!html.trim()) return { success: false, message: 'The document appears to be empty.' };
        return { success: true, result: parseHtmlManuscript(html) };
      } catch {
        return { success: false, message: 'Could not read the DOCX file.' };
      }
    }

    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      const text = await file.text();
      if (!text.trim()) return { success: false, message: 'The document appears to be empty.' };
      return { success: true, result: parsePlainTextManuscript(text) };
    }

    return { success: false, message: 'Import supports .docx, .txt, and .md files in this v2 preview.' };
  }

  if (!pastedText) {
    return { success: false, message: 'Paste text or choose a file to import.' };
  }

  return { success: true, result: parsePlainTextManuscript(pastedText) };
}

export async function saveReviewedImportChaptersAction(
  bookId: string,
  reviewedChapters: unknown,
): Promise<SaveImportResult> {
  await getBookWithChaptersAction(bookId);
  const chapters = sanitizeReviewedChapters(reviewedChapters);

  if (chapters.length === 0) {
    return { success: false, message: 'Review at least one chapter with a title and content before saving.' };
  }

  for (const chapter of chapters) {
    const result = await createChapterAction(bookId, {
      title: chapter.title,
      content: chapter.content,
      authorNotes: '',
      collectionId: null,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }
  }

  revalidatePath(`/write/${bookId}`);
  revalidatePath(`/library/${bookId}`);
  return { success: true, createdCount: chapters.length };
}
```

- [ ] **Step 3: Run parser tests and build**

Run:

```bash
npx tsx --test tests/unit/import/manuscript.test.ts
npm run build
```

Expected: both pass.

- [ ] **Step 4: Commit actions**

```bash
git add lib/actions/import.actions.ts lib/actions/docx.actions.ts
git commit -m "feat: add manuscript import actions"
```

---

### Task 4: Add Import Review UI Route

**Files:**
- Create: `components/v2/import/import-review-client.tsx`
- Create: `app/[locale]/(app)/write/[bookId]/import/page.tsx`
- Modify: `components/v2/workspace/project-workspace-shell.tsx`

- [ ] **Step 1: Create import review client**

Create `components/v2/import/import-review-client.tsx` with a client component that:

- Shows a paste textarea and file input accepting `.docx,.txt,.md`.
- Calls `parseManuscriptImportAction(formData)`.
- Renders total chapters and warning count.
- Renders editable chapter title and content textarea for each parsed chapter.
- Shows warning messages for each chapter.
- Allows removing a chapter.
- Allows merging a chapter into the previous chapter.
- Calls `saveReviewedImportChaptersAction(bookId, chapters)` and redirects to `/write/${bookId}` on success.

Use these exact user-visible labels because Playwright will target them:

```text
Import manuscript
Paste manuscript text
Choose manuscript file
Review detected chapters
Warnings
Remove chapter
Merge with previous
Save imported chapters
```

Use `TactileSurface`, `Button`, `AlertTriangle`, `FileText`, `Loader2`, `UploadCloud`, and `X`.

- [ ] **Step 2: Create import route page**

Create `app/[locale]/(app)/write/[bookId]/import/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ImportReviewClient } from '@/components/v2/import/import-review-client';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export const metadata: Metadata = {
  title: 'Import Manuscript',
  description: 'Import and review manuscript chapters before saving them to Beehive Books.',
};

export default async function ImportManuscriptPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  try {
    await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  return <ImportReviewClient bookId={bookId} />;
}
```

- [ ] **Step 3: Add workspace import link**

In `components/v2/workspace/project-workspace-shell.tsx`, import `UploadCloud` from `lucide-react` and add an action link in the main action grid:

```tsx
<WorkspaceActionLink
  href={`/write/${book.id}/import`}
  label="Import manuscript"
  description="Parse a manuscript, review chapter boundaries, and fix suspicious results before saving."
  icon={UploadCloud}
/>
```

Place it near `New chapter`/`Table of contents`.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 5: Commit UI route**

```bash
git add components/v2/import/import-review-client.tsx app/[locale]/(app)/write/[bookId]/import/page.tsx components/v2/workspace/project-workspace-shell.tsx
git commit -m "feat: add v2 manuscript import review route"
```

---

### Task 5: Add Import E2E Coverage

**Files:**
- Create: `tests/e2e/v2/import.spec.ts`

- [ ] **Step 1: Add Playwright import review spec**

Create `tests/e2e/v2/import.spec.ts` based on `tests/e2e/v2/workspace.spec.ts` auth and cleanup helpers. Cover:

- Create a book.
- Open `/write/${bookId}` and verify `Import manuscript` link href `/write/${bookId}/import`.
- Open import route.
- Paste:

```text
Chapter 1
Opening body text.

Chapter 2: The Hive
Second body text.
```

- Click `Review detected chapters`.
- Verify two chapter cards and no save occurs yet.
- Edit first title to `Opening`.
- Click `Save imported chapters`.
- Wait for `/write/${bookId}`.
- Verify workspace shows `Draft first`, `Opening`, and `2 chapters`.

Also add a second test that pastes a long first line with no real body and verifies `Warnings` is visible before save.

- [ ] **Step 2: Run import E2E**

Run:

```bash
npx playwright test tests/e2e/v2/import.spec.ts --project=chromium --reporter=dot
```

Expected: pass.

- [ ] **Step 3: Run existing workspace E2E**

Run:

```bash
npx playwright test tests/e2e/v2/workspace.spec.ts --project=chromium --reporter=dot
```

Expected: pass.

- [ ] **Step 4: Commit E2E**

```bash
git add tests/e2e/v2/import.spec.ts
git commit -m "test: cover v2 manuscript import review"
```

---

### Task 6: Final Verification

**Files:**
- No planned source edits.

- [ ] **Step 1: Run unit and E2E smoke**

Run:

```bash
npx tsx --test tests/unit/import/manuscript.test.ts
npx playwright test tests/e2e/v2/import.spec.ts --project=chromium --reporter=dot
npx playwright test tests/e2e/v2/workspace.spec.ts --project=chromium --reporter=dot
```

Expected: all pass.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: pass with only known middleware warning.

- [ ] **Step 3: Inspect git state**

Run:

```bash
git status --short
git log --oneline -8
```

Expected: clean worktree and commits for tests, parser, actions, UI, E2E.

---

## Self-Review

**Spec coverage:** This plan directly covers the known import defect class: body text in title, missing content, no review before save, public-domain heading patterns, suspicious warnings, and user-editable confirmation. It preserves existing schema and saves through current chapter actions.

**Known deferrals:** EPUB review migration, existing-bad-data repair tools, premium import gates, import history, DOCX fixture binaries, and bulk split UI are deferred to later slices. The parser/API shape created here supports those future steps.

**Red-flag scan:** No step contains TBD/fill-in language. Task 4 describes required behavior and exact labels rather than full JSX because the component is UI-heavy, but it gives concrete accepted behavior, imports, actions, and labels.

**Type consistency:** `ImportChapterDraft`, `ImportParseResult`, `ImportWarning`, and action result names match across tests, parser, actions, and UI.
