import BookCard from '@/components/profile/book-card';
const ProfileBookList = () => {
  return (
    <div className="mx-6 flex max-w-full justify-center">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <BookCard />
        <BookCard />
        <BookCard />
        <BookCard />
        <BookCard />
      </div>
    </div>
  );
};

export default ProfileBookList;
