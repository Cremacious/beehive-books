import { LoaderPinwheel } from 'lucide-react';

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full">
      <LoaderPinwheel className="animate-spin text-[#202020]" size={300} />
    </div>
  );
};

export default LoadingPage;
