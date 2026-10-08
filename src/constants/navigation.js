import {
  Home, Users, Building2, Stethoscope, Info, Phone, LogIn, UserPlus,
  LayoutDashboard, CalendarCheck, FileText, Pill, Bell, Ambulance, Settings,
  UserCog, BarChart3, Shield, Clock, Star, User,
} from "lucide-react";

export const NAV_LINKS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Doctors", path: "/doctors", icon: Stethoscope },
  { name: "Hospitals", path: "/hospitals", icon: Building2 },
  { name: "Services", path: "/services", icon: Users },
  { name: "About", path: "/about", icon: Info },
  { name: "Contact", path: "/contact", icon: Phone },
];

export const AUTH_LINKS = [
  { name: "Login", path: "/login", icon: LogIn, variant: "ghost" },
  { name: "Sign Up", path: "/register", icon: UserPlus, variant: "primary" },
];

export const PATIENT_SIDEBAR = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/dashboard/appointments", icon: CalendarCheck },
  { name: "Doctors", path: "/dashboard/doctors", icon: Stethoscope },
  { name: "Medical Records", path: "/dashboard/records", icon: FileText },
  { name: "Prescriptions", path: "/dashboard/prescriptions", icon: Pill },
  { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
  { name: "Emergency", path: "/dashboard/emergency", icon: Ambulance },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export const DOCTOR_SIDEBAR = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/dashboard/appointments", icon: CalendarCheck },
  { name: "Patients", path: "/dashboard/patients", icon: Users },
  { name: "Medical Records", path: "/dashboard/records", icon: FileText },
  { name: "Prescriptions", path: "/dashboard/prescriptions", icon: Pill },
  { name: "Schedule", path: "/dashboard/schedule", icon: Clock },
  { name: "Reviews", path: "/dashboard/reviews", icon: Star },
  { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export const ADMIN_SIDEBAR = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Users", path: "/dashboard/users", icon: UserCog },
  { name: "Doctors", path: "/dashboard/doctors", icon: Stethoscope },
  { name: "Hospitals", path: "/dashboard/hospitals", icon: Building2 },
  { name: "Appointments", path: "/dashboard/appointments", icon: CalendarCheck },
  { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { name: "Emergency", path: "/dashboard/emergency", icon: Shield },
  { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export const PATIENT_BOTTOM_NAV = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/dashboard/appointments", icon: CalendarCheck },
  { name: "Records", path: "/dashboard/records", icon: FileText },
  { name: "Profile", path: "/dashboard/profile", icon: User },
];

export const DOCTOR_BOTTOM_NAV = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", path: "/dashboard/patients", icon: Users },
  { name: "Schedule", path: "/dashboard/schedule", icon: Clock },
  { name: "Profile", path: "/dashboard/profile", icon: User },
];

export const ADMIN_BOTTOM_NAV = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Users", path: "/dashboard/users", icon: UserCog },
  { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", path: "/dashboard/profile", icon: User },
];
