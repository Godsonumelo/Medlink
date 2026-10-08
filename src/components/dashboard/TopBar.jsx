import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../services/notifications";

export default function TopBar({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    let cancelled = false;
    notificationService
      .getUnread()
      .then((data) => {
        if (cancelled) return;
        const items = data?.data || data;
        setHasUnread(Array.isArray(items) ? items.length > 0 : !!data?.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dropdownOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/doctors?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-gray-lighter">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="lg:hidden p-2 text-gray-dark hover:text-dark"
          >
            <Menu className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-2 bg-background rounded-[12px] px-4 py-2.5 w-72">
            <Search className="w-4 h-4 text-gray-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent body-small text-dark placeholder:text-gray-light w-full outline-none"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/notifications"
            aria-label="Notifications"
            className="relative p-2 text-gray-dark hover:text-dark transition-colors"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />}
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-background transition-colors"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white body-small font-medium">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="body-small font-medium text-dark leading-tight">{user?.name || "User"}</p>
                <p className="caption text-gray leading-tight capitalize">{user?.role || "patient"}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-[12px] shadow-elevated border border-gray-lighter py-2 z-50">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 body-small text-gray-dark hover:bg-background transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 body-small text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
