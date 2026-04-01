import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function Layout() {
  return (
    <main className="min-w-screen h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </div>
    </main>
  );
}

export default Layout;
