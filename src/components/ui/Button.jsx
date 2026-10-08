import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_10px_30px_rgba(15,118,110,0.35)]",
  outline:
    "bg-white text-dark border border-gray-lighter hover:border-primary/40",
  ghost: "bg-transparent text-primary hover:bg-primary/5",
};

const SIZES = {
  md: "h-11 px-5",
  lg: "h-[54px]",
};

export default function Button({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[16px] transition-all duration-300 cursor-pointer whitespace-nowrap";
  const classes = `${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} {...props}>
      <span className={classes}>{children}</span>
    </motion.button>
  );
}
