import { useAuth } from "../../hooks/useAuth";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import AdminDashboard from "./AdminDashboard";

const dashboardMap = {
  patient: PatientDashboard,
  doctor: DoctorDashboard,
  admin: AdminDashboard,
};

export default function DashboardRouter() {
  const { user } = useAuth();
  const role = user?.role || "patient";
  const DashboardComponent = dashboardMap[role] || PatientDashboard;

  return <DashboardComponent />;
}
