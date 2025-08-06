
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreateChapterButton from '@/components/buttons/create-chapter-button';
import BookDetailsHero from '@/components/books/book-details-hero';
import { userBooks } from '@/lib/sampleData';



export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const bookId = (await params).bookId;

  console.log('Loading book with ID:', bookId);
  const book = userBooks[0]
  const chapters = book ? book.chapters : [];

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="darkContainer">
        <div className="mb-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-medium transition-colors"
          >
            ← Back to Bookshelf
          </Link>
        </div>

        <BookDetailsHero book={book} />

        <div className="pt-10 max-w-5xl mx-auto p-6 whiteContainer">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-['Caveat',cursive] flex items-center gap-2">
              Chapters
            </h2>
            <Button className="">Add Chapter</Button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-yellow-50  border-b-4 border-b-yellow-400 border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-yellow-400 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={'chapter'}>Chapter {index + 1}</Badge>
                      {chapter.status === 'completed' ? (
                        <Badge variant={'completed'}>Completed</Badge>
                      ) : chapter.status === 'inProgress' ? (
                        <Badge variant={'inProgress'}>In Progress</Badge>
                      ) : (
                        <Badge variant={'wood'}>Draft</Badge>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2 poppins group-hover:text-yellow-700 transition-colors">
                      {chapter.title}
                    </h3>

                    <p className="text-slate-800 mb-3 leading-relaxed">
                      {chapter.content}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-800 ">
                      <span> {chapter.wordCount.toLocaleString()} words</span>
                      <span>{chapter.comments.length} comments</span>
                      <span>Updated {chapter.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button asChild>
                      <Link href={`/books/${book.id}/chapters/${chapter.id}`}>
                        Read
                      </Link>
                    </Button>
                    <Button variant={'secondary'}>Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href={`/books/33/chapters/create`}>Create New Chapter</Link>

          <div className="mt-8 text-center py-12 bg-yellow-50 rounded-2xl border-2 border-yellow-200 border-dashed">
            <div className="text-4xl mb-3">🐝</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-['Caveat',cursive]">
              Ready to add more chapters?
            </h3>
            <p className="text-slate-700 mb-4">
              Keep your story buzzing with new adventures!
            </p>
            <CreateChapterButton />
          </div>
        </div>
      </div>
    </div>
  );
}
