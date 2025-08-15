import CreateChapterForm from '@/components/forms/create-chapter-form';

export default async function CreateChapterPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-4 px-2 md:px-6 pt-2">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl text-center md:text-4xl font-bold mb-4 text-yellow-400 font-playWright drop-shadow-sm">
                  Create a New Chapter
                </h1>

                <div className="text-white mt-2 text-lg text-center md:mx-0 mb-8">
                  Add a new chapter to your book! Fill out the details below to
                  begin writing your next section.
                </div>
              </div>
            </div>
            <div className="border-b-2 border-yellow-200" />
            <div className="md:p-6">
              <CreateChapterForm bookId={bookId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
