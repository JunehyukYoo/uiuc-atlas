function Navbar() {
  return (
    <nav className="h-16 shrink-0 p-4 flex justify-between items-center border-b-4 border-accent-foreground">
      <a href="/" className="text-2xl">
        UIUC Atlas
      </a>

      <div className="flex gap-2 text-xl">
        <a href="/">Map</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
      </div>
    </nav>
  );
}

export default Navbar;
