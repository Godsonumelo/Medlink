import { NavLink, useLocation } from "react-router-dom";
import { Activity, LogOut, ChevronLeft } from "lucide-react";

export default function Sidebar({ links, collapsed, onToggle, onLogout }) {
  const location = useLocation();

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-card border-r border-gray-lighter z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-5 h-16 border-b border-gray-lighter`}>
          {!collapsed && (
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-primary rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="heading-4 text-dark text-sm">Med<span className="text-primary">Link</span></span>
            </NavLink>
          )}
          {collapsed && (
            <div className="w-9 h-9 gradient-primary rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                (link.path === "/dashboard" && location.pathname === "/dashboard") ||
                (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    title={collapsed ? link.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] body-small font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-dark hover:bg-background hover:text-dark"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{link.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-lighter">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] body-small font-medium text-danger hover:bg-danger/10 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-gray-lighter rounded-full flex items-center justify-center shadow-soft hover:bg-background transition-colors"
        >
          <ChevronLeft className={`w-3 h-3 text-gray transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>
    </>
  );
}
