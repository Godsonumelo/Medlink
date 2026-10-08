import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import hospitalRoutes from "./routes/hospitals.js";
import appointmentRoutes from "./routes/appointments.js";
import recordRoutes from "./routes/records.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import notificationRoutes from "./routes/notifications.js";
import settingRoutes from "./routes/settings.js";
import vitalRoutes from "./routes/vitals.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/users.js";

const app = express();

if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const rateLimitBuckets = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message = "Too many requests, please try again later." } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl.split("?")[0]}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(429).json({ message });
    }
    next();
  };
}

const rateLimitCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (now > bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  }
}, 60 * 1000);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "medlink-api" });
});

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export function closeRateLimitTimer() {
  clearInterval(rateLimitCleanup);
}

export default app;
