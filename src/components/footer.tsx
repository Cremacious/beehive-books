export default function Footer() {
  return (
    <footer className="w-full py-6 customDark text-center text-yellow-400 text-sm border-t-4 border-yellow-400 mt-4">
      &copy; {new Date().getFullYear()} Beehive Books. Write, share, and grow
      together.
    </footer>
  );
}
