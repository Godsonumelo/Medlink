import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, HeartPulse, Stethoscope, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/ui/SectionTitle";
import ServiceCard from "../components/ui/ServiceCard";
import ServiceModal from "../components/ui/ServiceModal";
import Button from "../components/ui/Button";
import { SERVICES } from "../constants/services";

const STEPS = [
  {
    number: "01",
    title: "Choose a Service",
    description: "Select the healthcare service you need.",
    icon: Calendar,
  },
  {
    number: "02",
    title: "Connect",
    description: "Find the right healthcare professional or service.",
    icon: Stethoscope,
  },
  {
    number: "03",
    title: "Get Care",
    description: "Book, manage, and keep track of your healthcare from one place.",
    icon: HeartPulse,
  },
];

const FEATURES = [
  "Search by medical specialty",
  "View doctor information",
  "Check availability",
  "Book appointments easily",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Services() {
  const [activeService, setActiveService] = useState(null);

  return (
    <div className="gradient-landing">
      {/* ===================== HERO ===================== */}
      <section
        className="relative overflow-hidden pt-28 pb-16 lg:pt-40 lg:pb-24"
        aria-label="MedLink services"
      >
        {/* Decorative teal/mint shapes */}
        <div className="absolute top-10 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />

        <div className="container-medlink relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left — copy */}
            <motion.div {...fadeUp}>
              <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[15px] font-semibold mb-6">
                MedLink Services
              </span>
              <h1 className="text-[40px] sm:text-5xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-dark mb-6">
                Healthcare That
                <br />
                Works Around <span className="text-primary">You</span>
              </h1>
              <p className="text-lg text-gray leading-relaxed max-w-[500px] mb-10">
                Access essential healthcare services from one simple, secure platform designed to
                make managing your health easier.
              </p>

              <div className="flex flex-wrap gap-5">
                <Button href="#services" size="lg" className="w-[190px]">
                  Explore Services <ArrowRight className="w-5 h-5" />
                </Button>
                <Button to="/doctors" size="lg" variant="outline" className="w-[170px]">
                  Find a Doctor
                </Button>
              </div>
            </motion.div>

            {/* Right — visual */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:flex justify-center"
            >
              <div className="relative w-[340px] h-[400px]">
                <div
                  className="absolute -bottom-[90px] left-1/2 -translate-x-1/2 ml-5 w-[400px] h-[400px] rounded-full"
                  style={{ backgroundColor: "#dff7f3", zIndex: 0 }}
                />
                <img
                  src="/images/doctors/hero-cutout.png"
                  alt="MedLink healthcare professional"
                  className="relative z-10 w-full h-auto translate-x-5"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES GRID ===================== */}
      <section id="services" className="py-20 bg-card" aria-label="All services">
        <div className="container-medlink">
          <SectionTitle
            badge="Our Services"
            title="Everything You Need for Better Healthcare"
            subtitle="From finding the right doctor to managing appointments and medical records, MedLink brings essential healthcare services together in one place."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                delay={i * 0.1}
                onLearnMore={setActiveService}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED SERVICE ===================== */}
      <section className="py-20" aria-label="Find the right doctor">
        <div className="container-medlink">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center bg-card rounded-[28px] border border-gray-lighter/60 shadow-soft p-8 lg:p-14 overflow-hidden"
          >
            {/* Left — visual */}
            <div className="relative rounded-[20px] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 min-h-[320px]">
              <img
                src="/images/doctors/featured-service.jpg"
                alt="Doctor ready to help you book a consultation"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute bottom-6 right-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            </div>

            {/* Right — copy */}
            <div>
              <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[15px] font-semibold mb-5">
                Featured Service
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-4">
                Connect With the Right Healthcare Professional
              </h2>
              <p className="text-lg text-gray leading-relaxed mb-8 max-w-[520px]">
                Finding the right healthcare professional shouldn&apos;t be complicated. MedLink
                helps you discover doctors based on specialty, availability, and location.
              </p>

              <ul className="space-y-3.5 mb-10">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                    </span>
                    <span className="text-base text-dark font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button to="/doctors" size="lg" className="w-[190px]">
                Find a Doctor <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="py-20 bg-card" aria-label="How MedLink services work">
        <div className="container-medlink">
          <SectionTitle
            badge="How It Works"
            title="Healthcare Made Simple"
            subtitle="Three simple steps to get the care you need."
          />

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative bg-white rounded-[20px] border border-gray-lighter/60 shadow-soft p-8 text-center"
                >
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-1/2 left-full w-8 h-[2px] bg-secondary/40 z-10"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center shadow-soft">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
                  <p className="text-[15px] text-gray leading-relaxed">{step.description}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-20" aria-label="Get started">
        <div className="container-medlink">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[24px] bg-primary px-8 py-16 lg:px-16 lg:py-20 text-center"
          >
            <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-6 leading-tight">
                Take Control of Your Healthcare
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
                MedLink makes it easier to find care, manage appointments, and stay connected with
                your health.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[16px] h-[54px] px-9 bg-white text-primary hover:bg-[#F0FDFA] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ServiceModal service={activeService} onClose={() => setActiveService(null)} />
    </div>
  );
}
