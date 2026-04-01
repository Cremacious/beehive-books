import { ExploreNav } from '@/components/explore/explore-nav';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="-mx-2 md:-mx-3 -mt-2 md:mt-0">
        <ExploreNav />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
