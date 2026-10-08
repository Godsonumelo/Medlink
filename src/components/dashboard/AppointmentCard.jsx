import { MapPin, Clock } from "lucide-react";

export default function AppointmentCard({ appointment }) {
  const appointmentDoctor =
    appointment?.doctor && typeof appointment.doctor === "object"
      ? appointment.doctor?.name
      : appointment?.doctor;
  const specialty =
    appointment?.specialty ||
    (typeof appointment?.doctor === "object" ? appointment.doctor?.specialty : "") ||
    "";
  const location =
    appointment?.location ||
    appointment?.hospitalName ||
    (typeof appointment?.hospital === "object" ? appointment.hospital?.name : "") ||
    appointment?.hospital ||
    "";
  const doctorInitials = appointmentDoctor
    ? appointmentDoctor.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DR";

  return (
    <div className="flex items-center gap-4 p-4 bg-background rounded-[16px] hover:shadow-card transition-all">
      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
        <span className="text-white body-small font-medium">
          {doctorInitials}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="body-small font-medium text-dark truncate">{appointmentDoctor || "Unknown Doctor"}</h4>
        <p className="caption text-primary">{specialty}</p>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
        <div>
          <div className="flex items-center gap-1 caption text-gray">
            <Clock className="w-3 h-3" />
            {appointment.time}
          </div>
          <p className="caption text-gray-dark font-medium">{appointment.date}</p>
        </div>
        <div className="flex items-center gap-1 caption text-gray">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
      </div>

      <button className="px-4 py-2 rounded-[10px] body-small font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all shrink-0">
        View
      </button>
    </div>
  );
}
