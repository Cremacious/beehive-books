import SignUpForm from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full p-2">
        <div className="darkContainer">
          <div className='text-4xl font-bold text-yellow-400 text-center mt-6'>Sign Up</div>
          <div className="max-w-sm mx-auto">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
