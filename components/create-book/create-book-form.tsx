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
    <Card className="w-[350px] no-outline shadow-xl border-white border-8 bg-bee-dark">
      <CardHeader className="space-y-2">
        <GiTreeBeehive className="text-bee-yellow text-6xl mx-auto m-2" />
        <CardTitle className="text-bee-yellow text-center">
          Let&apos;s get buzzing!
        </CardTitle>
        <CardDescription className="text-white text-center">
          Create a new book to add to your collection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          className="hover:border-bee-yellow hover:border-4"
          placeholder="Title"
        ></Input>
        <Input
          className="hover:border-bee-yellow hover:border-4"
          placeholder="Author Name"
        ></Input>
        <Select>
          <SelectTrigger className="hover:border-bee-yellow hover:border-4">
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
      <CardFooter className="flex justify-center flex-col space-y-2">
        <Button variant="yellow" className="text-center font-bold text-xl">
          Create!
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateBookForm;
