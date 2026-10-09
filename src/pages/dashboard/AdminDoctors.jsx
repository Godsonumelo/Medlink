import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Stethoscope, UserCheck, CircleCheck, Users } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import { useApi } from "../../hooks/useApi";
import { doctorService } from "../../services/doctors";

function initials(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR"
  );
}

export default function AdminDoctors() {
  const doctorsApi = useMemo(() => () => doctorService.getAllAdmin(), []);
  const { data, loading, error, execute } = useApi(doctorsApi);

  useEffect(() => {
    execute().catch(() => {});
  }, [execute]);

  const doctors = data?.data || [];
  const signedUpCount = data?.signedUp ?? doctors.filter((d) => d.signedUp).length;
  const availableCount = doctors.filter((d) => d.available).length;
  const profileCount = doctors.filter((d) => !d.signedUp).length;

  const summary = [
    { label: "Total Doctors", value: data?.total ?? doctors.length, icon: Stethoscope, color: "bg-primary/10 text-primary" },
    { label: "Signed Up", value: signedUpCount, icon: UserCheck, color: "bg-success/10 text-success" },
    { label: "Available", value: availableCount, icon: CircleCheck, color: "bg-info/10 text-info" },
    { label: "Profile Only", value: profileCount, icon: Users, color: "bg-warning/10 text-warning" },
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
          <h1 className="heading-3 text-dark">Doctors</h1>
          <p className="body-default text-gray">Every doctor on MedLink — profiles and signed-up accounts.</p>
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
        {doctors.length > 0 ? (
          doctors.map((doctor, i) => (
            <div
              key={doctor.key || doctor.email || i}
              className={`flex items-center gap-4 p-4 ${i !== doctors.length - 1 ? "border-b border-gray-lighter" : ""}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary body-small font-medium">{initials(doctor.name)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="body-small font-medium text-dark truncate">{doctor.name}</p>
                <p className="caption text-gray truncate">
                  {doctor.specialty ? `${doctor.specialty}${doctor.hospital ? ` · ${doctor.hospital}` : ""}` : doctor.email}
                </p>
              </div>
              <span
                className={`caption px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  doctor.signedUp ? "bg-success/10 text-success" : "bg-gray/10 text-gray"
                }`}
              >
                {doctor.signedUp ? "Signed up" : "No account"}
              </span>
              <span
                className={`caption px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  doctor.available ? "bg-info/10 text-info" : "bg-gray/10 text-gray"
                }`}
              >
                {doctor.available ? "Available" : "Unavailable"}
              </span>
            </div>
          ))
        ) : (
          <p className="body-small text-gray text-center py-6">No doctors found</p>
        )}
      </div>
    </div>
  );
}