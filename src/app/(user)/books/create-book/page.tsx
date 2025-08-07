import CreateBookForm from '@/components/forms/create-book-form';

export default function CreateBookPage({}) {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-5xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            {/* Decorative Bee/Book Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] drop-shadow-sm mb-1">
                  Create a New Book
                </h1>
                <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
                  Start your next adventure! Fill out the details below to add a
                  new book to your library.
                </p>
              </div>
            </div>
            {/* Divider */}
            <div className="border-b-2 border-yellow-200 mb-8" />
            <div className="md:p-6">
              <CreateBookForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
