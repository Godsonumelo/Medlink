import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

const CONSULTATION_FEE = 5000;

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey(d = new Date()) {
  return localDateKey(d).slice(0, 7);
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

function computeHealthScore(v) {
  let score = 100;
  if (v.systolic && v.diastolic) {
    if (v.systolic >= 140) score -= 20;
    else if (v.systolic < 100) score -= 10;
    if (v.diastolic >= 90) score -= 15;
  }
  if (v.heart_rate) {
    if (v.heart_rate > 100) score -= 15;
    else if (v.heart_rate < 50) score -= 10;
  }
  if (v.bmi) {
    if (v.bmi >= 30) score -= 15;
    else if (v.bmi >= 25) score -= 10;
    else if (v.bmi < 18.5) score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}

function publicAppointmentRow(row) {
  const doctorName =
    typeof row.doctor_name === "string" && row.doctor_name
      ? row.doctor_name
      : row.doctor?.name || "Doctor";
  return {
    id: row.id,
    doctorId: row.doctor_id,
    hospitalId: row.hospital_id,
    doctor: doctorName,
    specialty: row.specialty || row.doctor?.specialty || "",
    location: row.hospital_name || row.hospital?.name || "",
    date: row.date,
    time: row.time,
    type: row.type,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function patientDashboard(req, res) {
  const uid = req.user.id;
  const today = localDateKey();

  const upcoming = db
    .prepare(
      `SELECT a.*, d.name AS doctor_name, d.specialty, h.name AS hospital_name
       FROM appointments a
       LEFT JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN hospitals h ON h.id = a.hospital_id
       WHERE a.user_id = ? AND a.status != 'cancelled' AND substr(a.date, 1, 10) >= ?
       ORDER BY a.date ASC, a.time ASC`
    )
    .all(uid, today);

  const records = db
    .prepare("SELECT COUNT(*) AS c FROM medical_records WHERE user_id = ?")
    .get(uid);
  const prescriptions = db
    .prepare("SELECT COUNT(*) AS c FROM prescriptions WHERE user_id = ?")
    .get(uid);
  const latestVitals = db
    .prepare("SELECT * FROM health_metrics WHERE user_id = ? ORDER BY measured_at DESC LIMIT 1")
    .get(uid);

  res.json({
    role: "patient",
    generatedAt: new Date().toISOString(),
    stats: {
      upcomingAppointments: upcoming.length,
      totalRecords: records.c,
      totalPrescriptions: prescriptions.c,
      healthScore: latestVitals ? computeHealthScore(latestVitals) : null,
    },
    appointments: upcoming.map(publicAppointmentRow),
    vitals: latestVitals
      ? {
          systolic: latestVitals.systolic,
          diastolic: latestVitals.diastolic,
          heartRate: latestVitals.heart_rate,
          weightKg: latestVitals.weight_kg,
          bmi: latestVitals.bmi,
          measuredAt: latestVitals.measured_at,
        }
      : null,
  });
}

function doctorDashboard(req, res) {
  const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  let doctor = null;
  if (userRow) {
    doctor = db
      .prepare("SELECT * FROM doctors WHERE LOWER(email) = LOWER(?)")
      .get(userRow.email);
  }
  if (!doctor) {
    doctor = db
      .prepare("SELECT * FROM doctors ORDER BY id LIMIT 1")
      .get();
  }
  if (!doctor) {
    return res.status(404).json({ message: "No doctor profile found for this account" });
  }

  const today = localDateKey();
  const month = monthKey();
  const docId = doctor.id;

  const schedule = db
    .prepare(
      `SELECT a.*, u.name AS patient_name
       FROM appointments a JOIN users u ON u.id = a.user_id
       WHERE a.doctor_id = ? AND substr(a.date, 1, 10) = ?
       ORDER BY a.date ASC, a.time ASC`
    )
    .all(docId, today);

  const totalPatients = db
    .prepare("SELECT COUNT(DISTINCT user_id) AS c FROM appointments WHERE doctor_id = ?")
    .get(docId);
  const monthAppointments = db
    .prepare("SELECT COUNT(*) AS c FROM appointments WHERE doctor_id = ? AND status != 'cancelled' AND substr(date, 1, 7) = ?")
    .get(docId, month);
  const ratingRow = db
    .prepare("SELECT AVG(rating) AS avg FROM reviews WHERE doctor_id = ?")
    .get(docId);

  const recentPatients = db
    .prepare(
      `SELECT u.id, u.name, MAX(a.date) AS last_date, a.type AS reason
       FROM appointments a JOIN users u ON u.id = a.user_id
       WHERE a.doctor_id = ?
       GROUP BY u.id ORDER BY last_date DESC LIMIT 5`
    )
    .all(docId)
    .map((r) => ({
      id: r.id,
      name: r.name,
      lastVisit: r.last_date,
      reason: r.reason,
    }));

  res.json({
    role: "doctor",
    generatedAt: new Date().toISOString(),
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating || 0,
      patients: doctor.patients || 0,
    },
    stats: {
      totalPatients: totalPatients.c,
      todayAppointments: schedule.length,
      monthlyEarnings: monthAppointments.c * CONSULTATION_FEE,
      avgRating: ratingRow.avg ? Math.round(ratingRow.avg * 10) / 10 : 0,
    },
    todaySchedule: schedule.map((row) => ({
      id: row.id,
      time: row.time,
      date: row.date,
      patient: row.patient_name || "Patient",
      type: row.type,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
    })),
    recentPatients,
  });
}

function adminDashboard(req, res) {
  const today = localDateKey();
  const month = monthKey();

  const totalUsers = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  const activeDoctors = db
    .prepare("SELECT COUNT(*) AS c FROM doctors WHERE available = 1")
    .get();
  const partnerHospitals = db.prepare("SELECT COUNT(*) AS c FROM hospitals").get();
  const completedThisMonth = db
    .prepare("SELECT COUNT(*) AS c FROM appointments WHERE status != 'cancelled' AND substr(date, 1, 7) = ?")
    .get(month);
  const todayAppointments = db
    .prepare("SELECT COUNT(*) AS c FROM appointments WHERE substr(date, 1, 10) = ?")
    .get(today);
  const scheduled = db
    .prepare("SELECT COUNT(*) AS c FROM appointments WHERE status = 'scheduled'")
    .get();
  const recordsTotal = db.prepare("SELECT COUNT(*) AS c FROM medical_records").get();

  const recentUsers = db
    .prepare("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 3")
    .all();
  const recentAppointments = db
    .prepare(
      `SELECT a.*, u.name AS patient_name, d.name AS doctor_name
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       JOIN doctors d ON d.id = a.doctor_id
       ORDER BY a.created_at DESC LIMIT 3`
    )
    .all();
  const recentNotifications = db
    .prepare(
      `SELECT n.*, u.name AS user_name
       FROM notifications n JOIN users u ON u.id = n.user_id
       ORDER BY n.created_at DESC LIMIT 3`
    )
    .all();

  const activity = [
    ...recentAppointments.map((a) => ({
      type: "appointment",
      action: "Appointment booked",
      detail: `${a.patient_name} → ${a.doctor_name}`,
      createdAt: a.created_at,
    })),
    ...recentUsers.map((u) => ({
      type: "user",
      action: "New user signup",
      detail: u.name,
      createdAt: u.created_at,
    })),
    ...recentNotifications.map((n) => ({
      type: "notification",
      action: n.title,
      detail: n.message || "",
      createdAt: n.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const topDoctors = db
    .prepare("SELECT id, name, specialty, rating, patients, image FROM doctors ORDER BY rating DESC, patients DESC LIMIT 4")
    .all()
    .map((d) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      rating: d.rating,
      patients: d.patients,
      image: d.image,
    }));

  res.json({
    role: "admin",
    generatedAt: new Date().toISOString(),
    stats: {
      totalUsers: totalUsers.c,
      activeDoctors: activeDoctors.c,
      partnerHospitals: partnerHospitals.c,
      revenue: completedThisMonth.c * CONSULTATION_FEE,
    },
    quickStats: {
      appointmentsToday: todayAppointments.c,
      pendingApprovals: scheduled.c,
      totalRecords: recordsTotal.c,
    },
    recentActivity: activity,
    topDoctors,
  });
}

router.get("/", requireAuth, (req, res) => {
  try {
    const role = req.user.role || "patient";
    if (role === "doctor") return doctorDashboard(req, res);
    if (role === "admin") return adminDashboard(req, res);
    return patientDashboard(req, res);
  } catch (err) {
    serverError(res, err, "Failed to fetch dashboard data");
  }
});

export default router;