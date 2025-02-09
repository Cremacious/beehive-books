import ProfileHeader from '@/components/profile/profile-header';
import AddBookCard from '@/components/profile/add-book-card';
import ProfileImageCard from '@/components/profile/profile-image-card';
import ProfileBookList from '@/components/profile/profile-book-list';
import ProfileShareList from '@/components/profile/profile-share-list';

const ProfilePage = () => {
  return (
    <>
      <div className="flex flex-row justify-center ">
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
