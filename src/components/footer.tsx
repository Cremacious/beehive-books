export default function Footer() {
  return (
    <footer className="w-full py-6 customDark text-center text-yellow-400 text-sm border-t-4 border-yellow-400 mt-4 space-y-2">
      <div>&copy; {new Date().getFullYear()} Beehive Books.</div>
      <div>Write, share, and grow together.</div>
    </footer>
  );
}
