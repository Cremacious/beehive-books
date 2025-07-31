const Navbar = () => {
  return (
    <header className="w-full py-8 flex flex-col items-center bg-slate-900 shadow-md border-b-4 border-yellow-400">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-yellow-400 mb-2 drop-shadow-lg">
        Beehive Books
      </h1>
      <p className="text-lg md:text-xl text-yellow-100 max-w-2xl text-center">
        Write, share, and edit your books online with friends. Collaborative,
        private, and social book creation for everyone.
      </p>
    </header>
  );
};

export default Navbar;
