import Image from 'next/image';
import { Button } from '../ui/button';
import image from '@/public/images/default-profile.jpg';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

const AddBookCard = () => {
  return (
    <div className="">
      <Card className="border-none bg-bee-dark p-2">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-center">
              <Image
                src={image}
                alt="profile image"
                width={200}
                height={200}
                className="rounded-full"
              />
            </div>
            <div>
              <h2 className="mt-6 text-center font-bold text-white">
                Book Title
              </h2>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p className="text-center text-white">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis facere placeat totam iure quos enim nobis dignissimos
              fuga amet quasi, iste perspiciatis in incidunt eaque, fugit
              excepturi, officia ipsam. Nesciunt!
            </p>
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-row justify-center gap-4">
          <Button size="lg" variant="beeYellow" className="text-lg">
            View
          </Button>
          <Button size="lg" variant="beeYellowOutline" className="text-lg">
            Edit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddBookCard;
