import { GiTreeBeehive } from 'react-icons/gi';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CreateBookForm = () => {
  return (
    <Card className="no-outline w-[350px] border-8 border-white bg-bee-dark shadow-xl">
      <CardHeader className="space-y-2">
        <GiTreeBeehive className="m-2 mx-auto text-6xl text-bee-yellow" />
        <CardTitle className="text-center text-bee-yellow">
          Let&apos;s get buzzing!
        </CardTitle>
        <CardDescription className="text-center text-white">
          Create a new book to add to your collection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          className="hover:border-4 hover:border-bee-yellow"
          placeholder="Title"
        ></Input>
        <Input
          className="hover:border-4 hover:border-bee-yellow"
          placeholder="Author Name"
        ></Input>
        <Select>
          <SelectTrigger className="hover:border-4 hover:border-bee-yellow">
            <SelectValue placeholder="Select Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Genres</SelectLabel>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="science-fiction">Science Fiction</SelectItem>
              <SelectItem value="biography">Biography</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Textarea placeholder="Description..." />
      </CardContent>
      <CardFooter className="flex flex-col justify-center space-y-2">
        <Button variant="beeYellow" className="text-center text-xl font-bold">
          Create!
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateBookForm;
