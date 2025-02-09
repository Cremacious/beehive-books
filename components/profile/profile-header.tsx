import { Button } from '../ui/button';

const ProfileHeader = () => {
  return (
    <section className="flex items-center justify-center my-4">
      <div className="bg-bee-dark rounded-xl shadow-lg border-8 border-white p-8">
        <h1 className="text-bee-yellow text-center m-2 text-2xl">
          Welcome, User!
        </h1>
        <div className="bg-bee-dark border-4 border-bee-yellow rounded-xl m-2 p-2 text-bee-yellow text-center">
          <Button variant="yellow" className="font-bold text-xl m-2" size="lg">
            Messages
          </Button>
          <Button variant="yellow" className="font-bold text-xl" size="lg">
            Friend Requests
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
