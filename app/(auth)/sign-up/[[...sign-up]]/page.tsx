import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Image from 'next/image';
import Link from 'next/link';
import logoImage from '@/public/logo.png';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,195,0,0.07),transparent)]" />
      <div className="relative w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image
            src={logoImage}
            alt="Beehive Books"
            width={220}
            height={74}
            priority
          />
        </Link>
        <SignUp
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#FFC300',
              colorBackground: '#1c1c1c',
              colorInputBackground: '#252525',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              colorTextSecondary: 'rgba(255,255,255,0.55)',
              colorNeutral: '#ffffff',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-comfortaa), sans-serif',
            },
            elements: {
              card: 'shadow-2xl border border-[#2a2a2a]',
              headerTitle: 'mainFont',
              socialButtonsBlockButton: 'border-[#333] hover:border-[#444]',
              formButtonPrimary: 'bg-[#FFC300] hover:bg-[#FFD040] text-black font-bold',
              footerActionLink: 'text-[#FFC300] hover:text-[#FFD040]',
            },
          }}
        />
      </div>
    </div>
  );
}
