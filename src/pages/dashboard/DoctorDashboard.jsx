import { useEffect, useMemo, useState, useCallback } from "react";
import { Users, CalendarCheck, DollarSign, Star, Clock, Stethoscope } from "lucide-react";
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

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function visitLabel(dateStr) {
  if (!dateStr) return "—";
  const today = localDateKey();
  const yesterday = localDateKey(new Date(Date.now() - 86400000));
  if (dateStr.slice(0, 10) === today) return "Today";
  if (dateStr.slice(0, 10) === yesterday) return "Yesterday";
  return dateStr.slice(0, 10);
}

export default function DoctorDashboard() {
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

  const doctor = data?.doctor || {};
  const s = data?.stats || {};
  const todaySchedule = data?.todaySchedule || [];
  const recentPatients = data?.recentPatients || [];

  const stats = [
    { icon: Users, label: "Total Patients", value: s.totalPatients ?? "—", color: "primary" },
    { icon: CalendarCheck, label: "Today's Appointments", value: s.todayAppointments ?? "—", color: "info" },
    { icon: DollarSign, label: "This Month Earnings", value: s.monthlyEarnings != null ? `₦${s.monthlyEarnings.toLocaleString()}` : "—", color: "success" },
    { icon: Star, label: "Average Rating", value: s.avgRating ? `${s.avgRating.toFixed(1)} / 5` : "—", color: "warning" },
  ];

  const statusColors = {
    completed: "bg-success/10 text-success",
    scheduled: "bg-info/10 text-info",
    "in-progress": "bg-warning/10 text-warning",
    upcoming: "bg-info/10 text-info",
    cancelled: "bg-danger/10 text-danger",
  };

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
          <h1 className="heading-3 text-dark">Good Morning, {doctor.name || "Doctor"}! 👨‍⚕️</h1>
          <p className="body-default text-gray">Here&apos;s your practice overview for today.</p>
        </div>
        <LiveBadge lastUpdated={lastUpdated} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-4 text-dark">Today&apos;s Schedule</h2>
            <Link to="/dashboard/schedule" className="body-small text-primary font-medium hover:text-primary-dark">
              Full Schedule
            </Link>
          </div>
          <div className="bg-card rounded-[20px] shadow-card overflow-hidden">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((slot, i) => (
                <div key={slot.id || i} className={`flex items-center gap-4 p-4 ${i !== todaySchedule.length - 1 ? "border-b border-gray-lighter" : ""}`}>
                  <div className="w-16 text-center shrink-0">
                    <Clock className="w-4 h-4 text-gray-light mx-auto mb-1" />
                    <p className="caption font-medium text-dark">{slot.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-small font-medium text-dark">{slot.patient}</p>
                    <p className="caption text-gray">{slot.type || "Consultation"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full caption font-medium capitalize ${statusColors[slot.status] || statusColors.upcoming}`}>
                    {slot.status || "scheduled"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <CalendarCheck className="w-10 h-10 text-gray-light mx-auto mb-3" />
                <p className="body-small text-gray">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-4 text-dark">Recent Patients</h2>
            <Link to="/dashboard/patients" className="body-small text-primary font-medium hover:text-primary-dark">
              View All
            </Link>
          </div>
          <div className="bg-card rounded-[20px] shadow-card p-6 space-y-4">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient, i) => (
                <div key={patient.id || i} className={`flex items-center gap-3 ${i !== recentPatients.length - 1 ? "pb-4 border-b border-gray-lighter" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-small font-medium text-dark truncate">{patient.name}</p>
                    <p className="caption text-gray">{patient.reason || "Consultation"}</p>
                  </div>
                  <span className="caption text-gray shrink-0">{visitLabel(patient.lastVisit)}</span>
                </div>
              ))
            ) : (
              <p className="body-small text-gray text-center py-4">No patients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}