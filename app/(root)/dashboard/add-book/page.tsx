import AddBookForm from './add-book-form';

const AddBookPage = () => {
  return (
    <>
      <div className="flex max-h-screen justify-center">
        <div className="w-full max-w-7xl rounded-xl bg-white p-2 shadow-xl">
          <div className="rounded-xl bg-beeDark p-4">
            <AddBookForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBookPage;
