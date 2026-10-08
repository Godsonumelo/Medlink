import { useEffect, useMemo, useState, useCallback } from "react";
import { CalendarCheck, FileText, Pill, HeartPulse, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import AppointmentCard from "../../components/dashboard/AppointmentCard";
import LiveBadge from "../../components/dashboard/LiveBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import { useApi } from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { dashboardService } from "../../services/dashboard";

const LIVE_INTERVAL = 30000;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function PatientDashboard() {
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

  const stats = data
    ? [
        { icon: CalendarCheck, label: "Upcoming Appointments", value: data.stats?.upcomingAppointments ?? "—", color: "primary" },
        { icon: FileText, label: "Medical Records", value: data.stats?.totalRecords ?? "—", color: "secondary" },
        { icon: Pill, label: "Active Prescriptions", value: data.stats?.totalPrescriptions ?? "—", color: "info" },
        { icon: HeartPulse, label: "Health Score", value: data.stats?.healthScore == null ? "—" : `${data.stats.healthScore}%`, trend: "up", trendValue: "", color: "success" },
      ]
    : [];

  const appointmentList = data?.appointments || [];
  const vitals = data?.vitals || null;

  const healthMetrics = vitals
    ? [
        {
          label: "Blood Pressure",
          value: vitals.systolic != null && vitals.diastolic != null ? `${vitals.systolic}/${vitals.diastolic}` : "—",
          unit: "mmHg",
        },
        { label: "Heart Rate", value: vitals.heartRate ?? "—", unit: "bpm" },
        { label: "Weight", value: vitals.weightKg ?? "—", unit: "kg" },
        { label: "BMI", value: vitals.bmi ?? "—", unit: "" },
      ]
    : [];

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
          <h1 className="heading-3 text-dark">{getGreeting()}! 👋</h1>
          <p className="body-default text-gray">Here&apos;s an overview of your health dashboard.</p>
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
            <h2 className="heading-4 text-dark">Upcoming Appointments</h2>
            <Link to="/dashboard/appointments" className="body-small text-primary font-medium hover:text-primary-dark">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {appointmentList.length > 0 ? (
              appointmentList.map((apt, i) => (
                <AppointmentCard key={apt.id || i} appointment={apt} />
              ))
            ) : (
              <div className="bg-card rounded-[20px] p-8 text-center shadow-card">
                <CalendarCheck className="w-10 h-10 text-gray-light mx-auto mb-3" />
                <p className="body-small text-gray">No upcoming appointments</p>
                <Link to="/doctors" className="inline-block mt-3 text-primary body-small font-medium">
                  Book one now
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="heading-4 text-dark mb-4">Health Summary</h2>
            <div className="bg-card rounded-[20px] p-6 shadow-card space-y-4">
              {healthMetrics.length > 0 ? (
                healthMetrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="body-small text-gray">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="body-small font-medium text-dark">{metric.value}</span>
                      <span className="caption text-gray">{metric.unit}</span>
                      <span className="w-2 h-2 rounded-full bg-success" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="body-small text-gray text-center py-4">No health data recorded yet</p>
              )}
            </div>
          </div>

          <div className="bg-danger/5 border border-danger/20 rounded-[20px] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="heading-4 text-dark">Need Emergency Help?</h3>
            </div>
            <p className="body-small text-gray mb-4">Quick access to emergency services and ambulance.</p>
            <Link
              to="/dashboard/emergency"
              className="inline-flex items-center justify-center w-full py-3 bg-danger text-white rounded-[12px] body-small font-medium hover:bg-danger/90 transition-colors"
            >
              Call Emergency
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}