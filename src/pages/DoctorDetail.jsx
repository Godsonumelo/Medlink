import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Languages,
  Clock,
  ArrowLeft,
  CalendarPlus,
} from "lucide-react";
import { DOCTORS } from "../constants/doctors";
import Button from "../components/ui/Button";
import DoctorCard from "../components/ui/DoctorCard";

export default function DoctorDetail() {
  const { id } = useParams();
  const doctor = DOCTORS.find((d) => d.id === Number(id));

  if (!doctor) {
    return (
      <div className="gradient-landing">
        <section className="py-20">
          <div className="container-medlink text-center">
            <h1 className="text-3xl font-extrabold text-dark mb-6">
              Doctor not found
            </h1>
            <Button to="/doctors" variant="outline">
              Back to Doctors
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="gradient-landing">
      <section className="py-20" aria-label={`${doctor.name} profile`}>
        <div className="container-medlink">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-primary font-semibold text-base hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-10 items-start">
            {/* Photo + booking card */}
            <div className="bg-card rounded-3xl shadow-soft overflow-hidden sticky top-24">
              <div className="relative h-[420px] bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 px-3 py-1 bg-success text-white text-xs font-semibold rounded-full">
                  {doctor.availability}
                </span>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-dark">{doctor.name}</h2>
                <p className="text-primary font-semibold mt-1">
                  {doctor.specialty}
                </p>
                <div className="flex items-center justify-start gap-1 mt-3">
                  {Array.from({ length: Math.round(doctor.rating || 0) }).map(
                    (_, j) => (
                      <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                    )
                  )}
                  <span className="text-[15px] text-gray ml-1.5">
                    ({doctor.reviews} reviews)
                  </span>
                </div>
                <Button to="/register" className="w-full mt-6">
                  <CalendarPlus className="w-4 h-4" /> Book Appointment
                </Button>
              </div>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl lg:text-[40px] font-extrabold text-dark tracking-tight mb-6">
                About {doctor.name}
              </h1>
              <p className="text-lg text-gray leading-relaxed mb-8 max-w-[600px]">
                {doctor.about}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-light font-medium">
                      Experience
                    </p>
                    <p className="font-semibold text-dark">{doctor.experience}</p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-light font-medium">
                      Education
                    </p>
                    <p className="font-semibold text-dark">{doctor.education}</p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-light font-medium">
                      Location
                    </p>
                    <p className="font-semibold text-dark">{doctor.location}</p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Languages className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-light font-medium">
                      Languages
                    </p>
                    <p className="font-semibold text-dark">
                      {doctor.languages.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-light font-medium">
                      Availability
                    </p>
                    <p className="font-semibold text-dark">
                      {doctor.availability}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-8">
              Other Top Doctors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {DOCTORS.filter((d) => d.id !== doctor.id).map((d, i) => (
                <DoctorCard key={d.id} doctor={d} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}