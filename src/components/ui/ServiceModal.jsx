import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import Button from "./Button";

export default function ServiceModal({ service, onClose }) {
  const open = Boolean(service);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={service.title}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-[560px] max-h-[88vh] overflow-y-auto bg-white shadow-elevated"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 px-8 pt-8 pb-7">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 w-10 h-10 rounded-lg bg-white/80 text-gray hover:text-dark hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-14 h-14 rounded-2xl bg-white text-primary shadow-soft flex items-center justify-center mb-5">
                <service.icon className="w-7 h-7" strokeWidth={2} />
              </div>

              <h3 className="relative text-2xl sm:text-3xl font-extrabold text-dark tracking-tight pr-10">
                {service.title}
              </h3>
              <p className="relative text-[16px] text-gray leading-relaxed mt-3">
                {service.description}
              </p>
            </div>

            <div className="px-8 py-7">
              <p className="text-[16px] text-gray leading-relaxed">{service.details}</p>

              <ul className="space-y-3 mt-6">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] text-dark leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 mt-8">
                {service.to ? (
                  <Button to={service.to} onClick={onClose}>
                    {service.cta} <ArrowRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button onClick={onClose}>Got it</Button>
                )}

                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
