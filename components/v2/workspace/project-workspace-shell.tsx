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
  const primaryLabel = latestChapter ? 'Continue writing' : 'Write first chapter';

  return (
    <div
      data-testid="v2-project-workspace"
      className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8"
    >
      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <TactileSurface as="section" grit className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#FFC300] mainFont">
                Project workspace
              </p>
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
              <div key={stat.label} className="rounded-lg border border-white/8 bg-black/20 p-3">
                <p className="text-lg font-bold text-white mainFont">
                  {stat.value.toLocaleString()} {stat.label}
                </p>
              </div>
            ))}
          </div>
        </TactileSurface>

        <TactileSurface as="aside" className="p-5">
          <p className="text-sm font-bold text-white mainFont">Status</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Draft</dt>
              <dd className="text-right text-white">
                {getDraftStatusLabel(book.draftStatus)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Publishing</dt>
              <dd className="text-right text-white">
                {getPublishingStatusLabel(book.publishingStatus)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Updated</dt>
              <dd className="text-right text-white">
                {formatWorkspaceDate(book.updatedAt)}
              </dd>
            </div>
          </dl>
        </TactileSurface>
      </header>

      <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-5">
          <TactileSurface as="section" grit className="p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#FFC300] mainFont">
                  {mode === 'draft' ? 'Draft desk' : 'Planning desk'}
                </p>
                <h2 className="mt-1 break-words text-xl font-bold text-white mainFont">
                  {mode === 'draft'
                    ? 'Keep the manuscript moving'
                    : 'Shape the book before chapter one'}
                </h2>
              </div>
              <Link
                href={primaryHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FFC300]/30 bg-[#FFC300] px-4 py-2 text-sm font-bold text-black shadow-[0_3px_0_#8f6d00] transition-colors hover:bg-[#FFD040]"
              >
                <PencilLine aria-hidden="true" className="h-4 w-4" />
                {primaryLabel}
              </Link>
            </div>

            {latestChapter ? (
              <div className="mt-5 rounded-lg border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase text-white/45">Latest chapter</p>
                <h3 className="mt-2 break-words text-lg font-bold text-white mainFont">
                  {latestChapter.title}
                </h3>
                <p className="mt-1 text-sm text-white/65">
                  {latestChapter.wordCount.toLocaleString()} words
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-[#FFC300]/30 bg-[#FFC300]/8 p-4">
                <p className="text-sm leading-6 text-white/75">
                  Start with a working chapter, then use this workspace as the command center
                  for planning, collaboration, publishing, and export.
                </p>
              </div>
            )}
          </TactileSurface>

          <div className="grid gap-4 md:grid-cols-2">
            {latestChapter && (
              <WorkspaceActionLink
                href={`/library/${book.id}/create-chapter`}
                label="New chapter"
                description="Use the existing editor and chapter save flow."
                icon={FileText}
              />
            )}
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
              Outline, worldbuilding, character boards, and import repair belong here next.
              For this slice, the workspace creates the stable home for those tools.
            </p>
          </TactileSurface>

          <section className="grid gap-3">
            <div className="flex items-center gap-2 px-1">
              <Share2 aria-hidden="true" className="h-4 w-4 text-[#FFC300]" />
              <h2 className="text-base font-bold text-white mainFont">Launch path</h2>
            </div>
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
          </section>
        </aside>
      </main>
    </div>
  );
}
