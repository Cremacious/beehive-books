'use client';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { deleteBookById, deleteChapterById } from '@/lib/actions/book.actions';
import { Button } from './ui/button';

export default function DeleteDialog({
  type,
  deleteId,
}: {
  type: string;
  deleteId: string;
}) {
  const router = useRouter();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    switch (type) {
      case 'book':
        await deleteBookById(deleteId);
        router.push('/books');

      case 'chapter':
        await deleteChapterById(deleteId);
        router.back();

      default:
        break;
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="bg-red-500 hover:bg-red-600 border-b-4 border-b-red-600 hover:border-b-red-700">
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="rounded-lg" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleDelete} className="" type="submit">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
