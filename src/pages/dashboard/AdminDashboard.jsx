import { useEffect, useMemo, useState, useCallback } from "react";
import { Users, Stethoscope, Building2, DollarSign, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import LiveBadge from "../../components/dashboard/LiveBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import { useApi } from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { dashboardService } from "../../services/dashboard";

const LIVE_INTERVAL = 30000;

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function AdminDashboard() {
  const dashboardApi = useMemo(() => () => dashboardService.get(), []);
  const { data, error, execute } = useApi(dashboardApi);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(() => {
    execute()
      .then(() => {
        setLoaded(true);
        setLastUpdated(Date.now());
      })
      .catch(() => {});
  }, [execute]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  usePolling(refresh, LIVE_INTERVAL);

  const s = data?.stats || {};
  const qs = data?.quickStats || {};
  const recentActivity = data?.recentActivity || [];
  const topDoctors = data?.topDoctors || [];

  const stats = [
    { icon: Users, label: "Total Users", value: s.totalUsers ?? "—", color: "primary" },
    { icon: Stethoscope, label: "Active Doctors", value: s.activeDoctors ?? "—", color: "info" },
    { icon: Building2, label: "Partner Hospitals", value: s.partnerHospitals ?? "—", color: "secondary" },
    { icon: DollarSign, label: "Revenue This Month", value: s.revenue != null ? `₦${s.revenue.toLocaleString()}` : "—", color: "success" },
  ];

  const activityColors = {
    doctor: "bg-info/10 text-info",
    hospital: "bg-secondary/10 text-secondary",
    user: "bg-primary/10 text-primary",
    appointment: "bg-success/10 text-success",
    notification: "bg-warning/10 text-warning",
    alert: "bg-warning/10 text-warning",
  };

  const quickStats = [
    { label: "Appointments Today", value: qs.appointmentsToday ?? "—", icon: Activity },
    { label: "Pending Approvals", value: qs.pendingApprovals ?? "—", icon: Users },
    { label: "Active Reports", value: qs.totalRecords ?? "—", icon: TrendingUp },
  ];

  if (error && !data) return <ErrorDisplay message={error} onRetry={refresh} />;
  if (!loaded) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="heading-3 text-dark">Admin Dashboard</h1>
          <p className="body-default text-gray">Platform overview and management.</p>
        </div>
        <LiveBadge lastUpdated={lastUpdated} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((qsItem, i) => (
          <div key={i} className="bg-card rounded-[20px] p-5 shadow-card flex items-center gap-4">
            <div className="w-11 h-11 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <qsItem.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="caption text-gray">{qsItem.label}</p>
              <p className="heading-4 text-dark">{qsItem.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-4 text-dark">Recent Activity</h2>
          </div>
          <div className="bg-card rounded-[20px] shadow-card overflow-hidden">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 ${i !== recentActivity.length - 1 ? "border-b border-gray-lighter" : ""}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activityColors[activity.type] || activityColors.notification}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-small font-medium text-dark">{activity.action}</p>
                    <p className="caption text-gray">{activity.detail}</p>
                  </div>
                  <span className="caption text-gray shrink-0">{timeAgo(activity.createdAt)}</span>
                </div>
              ))
            ) : (
              <p className="body-small text-gray text-center py-6">No recent activity</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-4 text-dark">Top Doctors</h2>
            <Link to="/dashboard/doctors" className="body-small text-primary font-medium hover:text-primary-dark">
              View All
            </Link>
          </div>
          <div className="bg-card rounded-[20px] shadow-card p-6 space-y-4">
            {topDoctors.length > 0 ? (
              topDoctors.map((doctor, i) => (
                <div key={doctor.id || i} className={`flex items-center gap-3 ${i !== topDoctors.length - 1 ? "pb-4 border-b border-gray-lighter" : ""}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white body-small font-medium">
                        {doctor.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "DR"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-small font-medium text-dark truncate">{doctor.name}</p>
                    <p className="caption text-gray">{doctor.specialty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="body-small font-medium text-dark">{doctor.patients || "—"}</p>
                    <p className="caption text-gray">patients</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="body-small text-gray text-center py-4">No doctors found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}