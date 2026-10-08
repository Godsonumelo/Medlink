import { motion } from "framer-motion";

export default function LandingStatCard({ stat, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-[24px] shadow-soft hover:shadow-elevated transition-shadow flex items-center gap-5 px-6 h-[110px] w-full max-w-[260px] lg:w-[260px]"
    >
      <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
        <stat.icon className="w-7 h-7 text-primary" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-2xl font-extrabold text-dark leading-none mb-1">
          {stat.number}
        </h3>
        <p className="text-sm font-semibold text-gray-dark leading-snug">{stat.label}</p>
        {stat.description && (
          <p className="text-xs text-gray leading-snug">{stat.description}</p>
        )}
      </div>
    </motion.div>
  );
}
