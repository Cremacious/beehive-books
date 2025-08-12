import CreateChapterForm from '@/components/forms/create-chapter-form';

export default function CreateChapterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-4 px-2 md:px-6 pt-2">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl text-center md:text-4xl font-bold text-yellow-400 font-playWright drop-shadow-sm mb-1">
                  Create a New Chapter
                </h1>
                <p className="text-white mt-2 text-center text-base md:text-lg max-w-2xl mx-auto md:mx-0 mb-8">
                  Add a new chapter to your book! Fill out the details below to
                  begin writing your next section.
                </p>
              </div>
            </div>
            <div className="border-b-2 border-yellow-200" />
            <div className="md:p-6">
              <CreateChapterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
