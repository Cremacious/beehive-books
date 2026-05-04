import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectWorkspaceShell } from '@/components/v2/workspace/project-workspace-shell';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';
import type { PublishingStatus, WorkspaceBook } from '@/lib/v2/workspace';

export const metadata: Metadata = {
  title: 'Project Workspace',
  description: 'Plan, draft, collaborate, publish, and export your book on Beehive Books.',
};

type BookWithChapters = Awaited<ReturnType<typeof getBookWithChaptersAction>>;

function toWorkspaceBook(book: BookWithChapters): WorkspaceBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    category: book.category,
    description: book.description,
    privacy: book.privacy,
    draftStatus: book.draftStatus,
    publishingStatus: book.publishingStatus as PublishingStatus,
    wordCount: book.wordCount,
    chapterCount: book.chapterCount,
    commentCount: book.commentCount,
    updatedAt: book.updatedAt,
    chapters: book.chapters,
    collections: book.collections,
  };
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book: BookWithChapters;
  try {
    book = await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  const workspaceBook = toWorkspaceBook(book);

  return <ProjectWorkspaceShell book={workspaceBook} />;
}
