import { useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopBar from "../components/dashboard/TopBar";
import MobileBottomNav from "../components/dashboard/MobileBottomNav";
import { useAuth } from "../hooks/useAuth";
import {
  PATIENT_SIDEBAR,
  DOCTOR_SIDEBAR,
  ADMIN_SIDEBAR,
  PATIENT_BOTTOM_NAV,
  DOCTOR_BOTTOM_NAV,
  ADMIN_BOTTOM_NAV,
} from "../constants/navigation";

const sidebarMap = {
  patient: PATIENT_SIDEBAR,
  doctor: DOCTOR_SIDEBAR,
  admin: ADMIN_SIDEBAR,
};

const bottomNavMap = {
  patient: PATIENT_BOTTOM_NAV,
  doctor: DOCTOR_BOTTOM_NAV,
  admin: ADMIN_BOTTOM_NAV,
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const role = user?.role || "patient";
  const sidebarLinks = sidebarMap[role] || PATIENT_SIDEBAR;
  const bottomLinks = bottomNavMap[role] || PATIENT_BOTTOM_NAV;

  return (
    <div className="min-h-screen bg-background">
      <ScrollRestoration />
      <Sidebar
        links={sidebarLinks}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={logout}
      />

      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />

        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav links={bottomLinks} />
    </div>
  );
}
