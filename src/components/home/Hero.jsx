import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden flex items-center min-h-[600px]"
      style={{ background: "linear-gradient(180deg, #F8FFFE 0%, #FFFFFF 100%)" }}
      aria-label="Hero"
    >
      <div className="container-medlink py-20 lg:pt-36 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-[40px] sm:text-5xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-dark mb-6">
              Quality Healthcare
              <br />
              Made Simple &amp;
              <br />
              <span className="text-primary">Accessible</span>
            </h1>

            <p className="text-lg text-gray leading-relaxed max-w-[500px] mb-10">
              Book appointments with trusted doctors, access medical records,
              and receive quality healthcare from anywhere.
            </p>

            <div className="flex flex-wrap gap-5">
              <Button to="/register" size="lg" className="w-[190px]">
                Book Appointment <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                to="/doctors"
                size="lg"
                variant="outline"
                className="w-[170px]"
              >
                Find Doctors
              </Button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full max-w-[400px] h-[360px] flex items-end justify-center ml-auto">
              {/* Teal circle behind doctor */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full"
                style={{ backgroundColor: "#dff7f3", zIndex: 0 }}
              />

              {/* Doctor image */}
              <img
                src="/images/doctors/hero-cutout.png"
                alt="MedLink Healthcare Professional"
                className="relative w-[320px] max-w-full"
                style={{
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  zIndex: 1,
                }}
              />
            </div>
          </motion.div>

          {/* Mobile Doctor Card (smaller) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="relative flex lg:hidden justify-center"
          >
            <div className="relative w-[240px] h-[300px]">
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-[240px] rounded-full"
                style={{ backgroundColor: "#dff7f3", zIndex: 0 }}
              />
              <img
                src="/images/doctors/hero-cutout.png"
                alt="MedLink Healthcare Professional"
                className="relative w-full h-full"
                style={{
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  zIndex: 1,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
