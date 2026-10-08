import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AuthGuard from "../components/auth/AuthGuard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Doctors from "../pages/Doctors";
import DoctorDetail from "../pages/DoctorDetail";
import Services from "../pages/Services";
import Hospitals from "../pages/Hospitals";
import Appointments from "../pages/Appointments";
import MedicalRecords from "../pages/MedicalRecords";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";
import DashboardRouter from "../pages/dashboard/DashboardRouter";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "doctors", element: <Doctors /> },
      { path: "doctors/:id", element: <DoctorDetail /> },
      { path: "hospitals", element: <Hospitals /> },
      { path: "services", element: <Services /> },
      { path: "about", element: <Home /> },
      { path: "contact", element: <Home /> },
      {
        path: "login",
        element: (
          <AuthGuard>
            <Login />
          </AuthGuard>
        ),
      },
      {
        path: "register",
        element: (
          <AuthGuard>
            <Register />
          </AuthGuard>
        ),
      },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardRouter /> },
      { path: "appointments", element: <Appointments /> },
      { path: "doctors", element: <Doctors /> },
      {
        path: "patients",
        element: (
          <ProtectedRoute roles={["doctor", "admin"]}>
            <Doctors />
          </ProtectedRoute>
        ),
      },
      { path: "records", element: <MedicalRecords /> },
      { path: "prescriptions", element: <MedicalRecords /> },
      {
        path: "schedule",
        element: (
          <ProtectedRoute roles={["doctor"]}>
            <Appointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "reviews",
        element: (
          <ProtectedRoute roles={["doctor"]}>
            <Appointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "hospitals", element: <Hospitals /> },
      { path: "notifications", element: <Notifications /> },
      { path: "emergency", element: <Hospitals /> },
      { path: "settings", element: <Settings /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
