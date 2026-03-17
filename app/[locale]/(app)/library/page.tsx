import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Library',
  description:
    'Your creative workspace — write, organize, and publish your books and chapters.',
};
import BookGrid from '@/components/library/book-grid';
import { getUserBooksAction } from '@/lib/actions/book.actions';

// TODO: Allow users to make a custom book order.

//TODO: Add QR code functionality


export default async function LibraryPage() {
  const books = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Writing Workspace
        </p>
        <h1 className="text-3xl font-bold text-white mainFont">My Library</h1>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          The home for your writing. Upload books, build out chapters, and shape
          your stories from first draft to final page.
        </p>
      </div>
      <BookGrid books={books} />
    </div>
  );
}
