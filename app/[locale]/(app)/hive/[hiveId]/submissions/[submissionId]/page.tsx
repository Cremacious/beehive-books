import { notFound } from 'next/navigation';
import { getSubmissionAction } from '@/lib/actions/hive-submissions.actions';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import BackButton from '@/components/shared/back-button';

export const metadata = { title: 'Submission Preview' };

export default async function SubmissionPreviewPage({
  params,
}: {
  params: Promise<{ hiveId: string; submissionId: string }>;
}) {
  const { hiveId, submissionId } = await params;

  let submission;
  try {
    submission = await getSubmissionAction(submissionId);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton href={`/hive/${hiveId}/submissions`} label="Back to Submissions" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">{submission.title}</h1>
        <div className="flex items-center gap-2 text-xs text-white/80">
          <span>by {submission.author.username ?? 'Unknown'}</span>
          {submission.targetChapterOrder != null && (
            <>
              <span>·</span>
              <span>Chapter {submission.targetChapterOrder}</span>
            </>
          )}
        </div>
      </div>

      <RichTextEditor content={submission.content} editable={false} />
    </div>
  );
}
