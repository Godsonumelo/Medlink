import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import Button from "./Button";

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DoctorCard({ doctor, delay = 0 }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = doctor.image && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="bg-card rounded-3xl shadow-soft overflow-hidden hover:shadow-elevated transition-all"
    >
      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
        {hasImage ? (
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{initials(doctor.name)}</span>
          </div>
        )}
        <span className="absolute top-4 right-4 px-3 py-1 bg-success text-white text-xs font-semibold rounded-full">
          {doctor.availability}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-dark mb-1">{doctor.name}</h3>
        <p className="text-[15px] font-semibold text-primary mb-3">
          {doctor.specialty}
        </p>

        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: Math.round(doctor.rating || 0) }).map((_, j) => (
            <Star key={j} className="w-4 h-4 fill-warning text-warning" />
          ))}
          <span className="text-[15px] text-gray ml-1.5">
            ({doctor.reviews} reviews)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-light mb-5">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs">{doctor.location}</span>
        </div>

        <Button to={`/doctors/${doctor.id}`} variant="outline" className="w-full">
          Book Appointment
        </Button>
      </div>
    </motion.div>
  );
}
