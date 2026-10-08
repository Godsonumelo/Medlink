import { NavLink, useLocation } from "react-router-dom";

export default function MobileBottomNav({ links }) {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-gray-lighter z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            (link.path === "/dashboard" && location.pathname === "/dashboard") ||
            (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-gray"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="caption font-medium">{link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
