import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, Stethoscope, User } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import { useApi } from "../../hooks/useApi";
import { userService } from "../../services/users";

function initials(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ROLE_STYLES = {
  admin: "bg-warning/10 text-warning",
  doctor: "bg-info/10 text-info",
  patient: "bg-success/10 text-success",
};

export default function AdminUsers() {
  const usersApi = useMemo(() => () => userService.getAll(), []);
  const { data, loading, error, execute } = useApi(usersApi);

  useEffect(() => {
    execute().catch(() => {});
  }, [execute]);

  const users = data?.data || [];
  const roleCounts = data?.roleCounts || {};

  const summary = [
    { label: "Total Users", value: data?.total ?? users.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Patients", value: roleCounts.patient ?? 0, icon: User, color: "bg-success/10 text-success" },
    { label: "Doctors", value: roleCounts.doctor ?? 0, icon: Stethoscope, color: "bg-info/10 text-info" },
    { label: "Admins", value: roleCounts.admin ?? 0, icon: UserCog, color: "bg-warning/10 text-warning" },
  ];

  if (error && !data) return <ErrorDisplay message={error} onRetry={() => execute().catch(() => {})} />;
  if (loading && !data) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="heading-3 text-dark">Users</h1>
          <p className="body-default text-gray">Everyone registered on MedLink.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((item, i) => (
          <div key={i} className="bg-card rounded-[20px] p-5 shadow-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="caption text-gray truncate">{item.label}</p>
              <p className="heading-4 text-dark">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[20px] shadow-card overflow-hidden">
        {users.length > 0 ? (
          users.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center gap-4 p-4 ${i !== users.length - 1 ? "border-b border-gray-lighter" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="body-small font-medium text-primary">{initials(u.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="body-small font-medium text-dark truncate">{u.name}</p>
                <p className="caption text-gray truncate">{u.email}</p>
              </div>
              <span
                className={`caption px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${
                  ROLE_STYLES[u.role] || "bg-gray/10 text-gray"
                }`}
              >
                {u.role}
              </span>
              <span className="caption text-gray shrink-0 hidden sm:block">{formatDate(u.createdAt)}</span>
            </div>
          ))
        ) : (
          <p className="body-small text-gray text-center py-6">No users found</p>
        )}
      </div>
    </div>
  );
}
