import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ProfilePage = async (params: { params: Promise<{ id: string }> }) => {
  const { id } = await params.params;
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
