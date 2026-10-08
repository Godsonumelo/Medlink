import { motion } from "framer-motion";

export default function SectionTitle({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-14">
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[15px] font-semibold mb-5"
        >
          {badge}
        </motion.span>
      )}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-dark tracking-tight"
        >
          {title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-[18px] text-gray max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
