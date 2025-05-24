import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <>
      {id}

      <Link href={`/profile/${id}/books/`}>
        <Button variant="outline">View Books</Button>
      </Link>
    </>
  );
};

export default ProfilePage;
