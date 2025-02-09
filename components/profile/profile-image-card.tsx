import image from '@/public/images/default-profile.jpg'
import Image from 'next/image';

const ProfileImageCard = () => {
    return ( <div className='flex justify-center bg-bee-dark p-4 rounded-xl shadow-lg border-8 border-white m-2'>
        <Image src={image} alt="profile image" width={200} height={200} className="rounded-full" />
    </div> );
}
 
export default ProfileImageCard;