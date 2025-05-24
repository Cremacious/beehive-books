import { getBookById } from '@/lib/actions/book.actions';
import AddChapterForm from './add-chapter-form';

const AddChapterPage = async ({
  params,
}: {
  params: { id: string; bookId: string };
}) => {
  const { bookId } = params;
  const book = await getBookById(bookId);
  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl rounded-xl bg-white p-2 shadow-xl">
          <div className="rounded-xl bg-beeDark p-4">
            {book?.title}
            <AddChapterForm bookId={bookId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddChapterPage;
