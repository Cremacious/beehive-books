import EditChapterForm from '@/components/forms/edit-chapter-form';
import { Button } from '@/components/ui/button';
import { getChapterById } from '@/lib/actions/book.actions';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;
  const chapter = await getChapterById({ chapterId });
  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto p-2">
        <div className="mb-4">
          <Button variant={'secondary'} asChild>
            <Link href={`/books/${bookId}`}>
              <MoveLeft className="mr-2" />
              Back to Book
            </Link>
          </Button>
        </div>
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-4 px-2 md:px-6 pt-2">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl text-center md:text-4xl font-bold mb-4 text-yellow-400 font-playWright drop-shadow-sm">
                  Edit Chapter: {chapter.title}
                </h1>

                <div className="text-white mt-2 text-lg text-center md:mx-0 mb-8">
                  Add a new chapter to your book! Fill out the details below to
                  begin writing your next section.
                </div>
              </div>
            </div>
            <div className="border-b-2 border-yellow-200" />
            <div className="md:p-6">
              <EditChapterForm chapter={chapter} bookId={bookId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
