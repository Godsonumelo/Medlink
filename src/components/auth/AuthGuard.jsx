import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

export default function AuthGuard({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
