import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DOCTORS } from "../../constants/doctors";
import DoctorCard from "../ui/DoctorCard";

export default function TopDoctors() {
  return (
    <section className="py-20 bg-transparent" aria-label="Top rated doctors">
      <div className="container-medlink">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[15px] font-semibold mb-5">
              Meet Our Experts
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-dark tracking-tight">
              Top Rated Doctors
            </h2>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-primary font-semibold text-base hover:gap-3 transition-all shrink-0"
            aria-label="View all doctors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOCTORS.map((doctor, i) => (
            <DoctorCard key={doctor.id} doctor={doctor} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
