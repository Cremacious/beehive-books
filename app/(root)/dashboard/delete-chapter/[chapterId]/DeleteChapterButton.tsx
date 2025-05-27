'use client';
import { Button } from '@/components/ui/button';
import { deleteChapter } from '@/lib/actions/book.actions';
import { toast } from 'sonner';

const DeleteChapterButton = ({ chapterId }: { chapterId: string }) => {
  const handleDelete = async () => {
    const response = await deleteChapter(chapterId);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };
  return (
    <>
      <Button onClick={handleDelete}>Delete The Chapter</Button>
    </>
  );
};

export default DeleteChapterButton;
