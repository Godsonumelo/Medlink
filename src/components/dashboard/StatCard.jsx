import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const trendColors = {
  up: "text-success",
  down: "text-danger",
};

const trendBg = {
  up: "bg-success/10",
  down: "bg-danger/10",
};

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color = "primary", delay = 0 }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-[20px] p-6 shadow-card hover:shadow-elevated transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full caption font-medium ${trendBg[trend]} ${trendColors[trend]}`}>
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </span>
        )}
      </div>
      <p className="body-small text-gray mb-1">{label}</p>
      <p className="heading-3 text-dark">{value}</p>
    </motion.div>
  );
}
