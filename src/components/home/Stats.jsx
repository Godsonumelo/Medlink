import { motion } from "framer-motion";
import { STATS } from "../../constants/stats";
import StatCard from "../ui/LandingStatCard";

export default function Stats() {
  return (
    <section className="py-20 bg-transparent" aria-label="MedLink statistics">
      <div className="container-medlink">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} delay={i * 0.1} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
