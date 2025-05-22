import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  return (
    <>
      dashboard
      <section>
        <div className="container mx-auto rounded-2xl bg-white p-2 text-white shadow-xl">
          <div className="rounded-2xl bg-beeDark p-4">
            Container
            <Link href="/dashboard/add-book">
              <Button className="">Add Book</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
