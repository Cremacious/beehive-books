import ClubForm from './club-form';
import type { BookClub } from '@/lib/types/club.types';

export default function EditClubForm({ club }: { club: BookClub }) {
  return (
    <ClubForm
      mode="edit"
      clubId={club.id}
      defaultValues={club}
      cancelHref={`/clubs/${club.id}`}
    />
  );
}
