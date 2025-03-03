import ProfileHeader from '@/components/profile/profile-header';
import AddBookCard from '@/components/profile/add-book-card';
import ProfileImageCard from '@/components/profile/profile-image-card';
import ProfileBookList from '@/components/profile/profile-book-list';
import ProfileShareList from '@/components/profile/profile-share-list';

const ProfilePage = () => {
  return (
    <>
      <div className="mx-auto mt-8 flex w-1/2 flex-col items-center rounded-xl border-8 border-white bg-bee-dark p-8 shadow-lg">
        <ProfileImageCard />
        <ProfileHeader />
      </div>
      <AddBookCard />
      <ProfileBookList />
      <ProfileShareList />
    </>
  );
};

export default ProfilePage;
