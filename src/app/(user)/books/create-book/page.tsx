import CreateBookForm from '@/components/forms/create-book-form';

export default function CreateBookPage({}) {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <div className="darkContainer">
        <div className="whiteContainer">
          <div className="md:p-6">
            <CreateBookForm />
          </div>
        </div>
      </div>
    </div>
  );
}
