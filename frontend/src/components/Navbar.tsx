import { useNavigate } from "react-router-dom";
import favicon from "/favicon.svg";

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="h-16 shrink-0 p-4 flex justify-between items-center border-b-4 border-accent-foreground">
      <h1
        className="text-2xl hover:cursor-pointer flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <img src={favicon} className="w-10" />
        UIUC Atlas
      </h1>

      <div className="flex gap-2 text-l">
        <a href="/">Map</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
      </div>
    </nav>
  );
}

export default Navbar;
