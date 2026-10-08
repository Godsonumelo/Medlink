import { useState } from "react";
import { Search } from "lucide-react";
import { DOCTORS, DOCTOR_SPECIALTIES } from "../constants/doctors";
import DoctorCard from "../components/ui/DoctorCard";

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const filtered = DOCTORS.filter((d) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q);
    const matchesSpecialty = specialty === "All" || d.specialty === specialty;
    return matchesQuery && matchesSpecialty;
  });

  return (
    <div className="gradient-landing">
      <section className="py-20" aria-label="All doctors">
        <div className="container-medlink">
          <div className="text-center mb-12">
            <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[15px] font-semibold mb-5">
              Book with Confidence
            </span>
            <h1 className="text-4xl lg:text-[46px] font-extrabold text-dark tracking-tight">
              Meet Our Doctors
            </h1>
            <p className="text-lg text-gray leading-relaxed max-w-[520px] mx-auto mt-4">
              Browse our trusted specialists and book an appointment today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-10">
            <div className="relative w-full sm:w-[360px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialty, or hospital..."
                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-lighter bg-white text-dark placeholder:text-gray-light focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-12 px-5 rounded-full border border-gray-lighter bg-white text-dark focus:outline-none focus:border-primary/40 transition-colors"
            >
              <option value="All">All Specialties</option>
              {DOCTOR_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray text-lg mt-16">
              No doctors match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((doctor, i) => (
                <DoctorCard key={doctor.id} doctor={doctor} delay={i * 0.1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}