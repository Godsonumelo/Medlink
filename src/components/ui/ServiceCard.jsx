import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ service, delay = 0, onLearnMore }) {
  const Icon = service.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      aria-label={service.title}
      className="h-full bg-card rounded-[20px] border border-gray-lighter/60 shadow-soft p-7 flex flex-col hover:shadow-elevated transition-shadow group"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 transition-transform group-hover:scale-110 shrink-0">
        <Icon className="w-7 h-7" strokeWidth={2} />
      </div>

      <h3 className="text-lg font-bold text-dark mb-2">{service.title}</h3>

      <p className="text-[15px] text-gray leading-relaxed flex-1">{service.description}</p>

      <button
        type="button"
        onClick={() => onLearnMore(service)}
        aria-label={`Learn more about ${service.title}`}
        className="inline-flex items-center gap-1.5 text-primary font-semibold text-[15px] mt-5 transition-all group-hover:gap-2.5 cursor-pointer self-start"
      >
        Learn more
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.article>
  );
}
