import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Your personalised feed — see what your friends and community are writing.',
};

const UserHomePage = () => {
  return (
    <div className="bg-red-500">UserHomePage</div>
  )
}

export default UserHomePage