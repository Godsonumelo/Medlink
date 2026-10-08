import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
