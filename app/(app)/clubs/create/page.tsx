import ClubForm from '@/components/clubs/club-form';

export const metadata = {
  title: 'Create a Book Club',
  description: 'Start a new book club and bring readers together around the books you love.',
};

export default function CreateClubPage() {
  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create a Book Club</h1>
        <p className="text-white/80 mt-1 text-sm">Bring readers together around the books you love.</p>
      </div>
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-6">
        <ClubForm mode="create" cancelHref="/clubs" />
      </div>
    </div>
  );
}
