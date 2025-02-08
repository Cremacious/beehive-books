import { APP_NAME } from '@/lib/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-bee-dark">
      <div className="text-center p-5 flex-center text-bee-yellow">
        {APP_NAME} &copy; {currentYear}. All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
