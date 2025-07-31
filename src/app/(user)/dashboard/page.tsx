import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto whiteContainer min-h-[500px]">
      <h1>Dashboard</h1>
           <Link
            href="/books/create-book"
            className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition border-3 border-slate-900 text-center hover:scale-105 transform"
          >
            Create New Books
          </Link>
    </div>
  );
}
