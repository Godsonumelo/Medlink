import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity } from "lucide-react";
import { NAV_LINKS } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          : "bg-white"
      }`}
    >
      <div className="container-medlink h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">
            Med<span className="text-[#0F766E]">Link</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-[#0F766E] ${
                location.pathname === link.path
                  ? "text-[#0F766E]"
                  : "text-[#475569]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0F766E] border-2 border-[#0F766E]/20 hover:border-[#0F766E] transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#475569] border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0F766E] border-2 border-[#0F766E]/20 hover:border-[#0F766E] transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#0D5E58] shadow-[0_4px_14px_rgba(15,118,110,0.3)] hover:shadow-[0_6px_20px_rgba(15,118,110,0.4)] transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 text-[#0F172A]"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] mx-4 mt-2 rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMobile}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-[#0F766E]/10 text-[#0F766E]"
                    : "text-[#475569] hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-[#0F766E] border-2 border-[#0F766E]/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { closeMobile(); logout(); }}
                  className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-[#475569] border-2 border-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-[#0F766E] border-2 border-[#0F766E]/20"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#0F766E]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
