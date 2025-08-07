import { BookOpen } from 'lucide-react';
import CreateChapterForm from '@/components/forms/create-chapter-form';

export default function CreateChapterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto p-2">
        <div className="darkContainer">
          <div className="whiteContainer relative overflow-hidden">
            {/* Decorative Bee/Book Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl drop-shadow-lg">🐝</span>
                <BookOpen className="w-10 h-10 text-yellow-500 drop-shadow-md" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] drop-shadow-sm mb-1">
                  Create a New Chapter
                </h1>
                <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
                  Add a new chapter to your book! Fill out the details below to
                  begin writing your next section.
                </p>
              </div>
            </div>
            {/* Divider */}
            <div className="border-b-2 border-yellow-200 mb-8" />
            <div className="md:p-6">
              <CreateChapterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
