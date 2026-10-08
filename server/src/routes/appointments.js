import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function publicAppointment(row) {
  let doctor = null;
  if (row.doctor_id) {
    const d = db.prepare("SELECT * FROM doctors WHERE id = ?").get(row.doctor_id);
    if (d) {
      doctor = { id: d.id, name: d.name, specialty: d.specialty, hospital: d.hospital };
    }
  }
  let hospital = null;
  if (row.hospital_id) {
    const h = db.prepare("SELECT * FROM hospitals WHERE id = ?").get(row.hospital_id);
    if (h) {
      hospital = { id: h.id, name: h.name, city: h.city };
    }
  }
  return {
    id: row.id,
    doctorId: row.doctor_id,
    hospitalId: row.hospital_id,
    date: row.date,
    time: row.time,
    type: row.type,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    doctor,
    hospital,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/appointments/upcoming
router.get("/upcoming", requireAuth, (req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM appointments WHERE user_id = ? AND status != 'cancelled' ORDER BY date ASC, time ASC"
      )
      .all(req.user.id);
    const data = rows.map(publicAppointment);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch upcoming appointments");
  }
});

// GET /api/appointments/past
router.get("/past", requireAuth, (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT * FROM appointments WHERE user_id = ? AND (status = 'completed' OR status = 'cancelled')
         ORDER BY date DESC, time DESC`
      )
      .all(req.user.id);
    const data = rows.map(publicAppointment);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch past appointments");
  }
});

// GET /api/appointments
router.get("/", requireAuth, (req, res) => {
  try {
    const { status, limit } = req.query;
    let rows;
    if (status) {
      rows = db
        .prepare("SELECT * FROM appointments WHERE user_id = ? AND status = ? ORDER BY date DESC, time DESC")
        .all(req.user.id, status);
    } else {
      rows = db
        .prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY date DESC, time DESC")
        .all(req.user.id);
    }
    let data = rows.map(publicAppointment);
    if (limit) {
      data = data.slice(0, Number(limit));
    }
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch appointments");
  }
});

// GET /api/appointments/:id
router.get("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM appointments WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Appointment not found" });
    res.json({ appointment: publicAppointment(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch appointment");
  }
});

// POST /api/appointments
router.post("/", requireAuth, (req, res) => {
  try {
    const { doctorId, hospitalId, date, time, type, notes } = req.body || {};
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }
    const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const result = db
      .prepare(
        "INSERT INTO appointments (user_id, doctor_id, hospital_id, date, time, type, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)"
      )
      .run(
        req.user.id,
        doctorId,
        hospitalId || null,
        date,
        time,
        type || "Consultation",
        notes || null,
        new Date().toISOString()
      );

    db.prepare(
      "INSERT INTO notifications (user_id, type, title, message, read, created_at) VALUES (?, 'appointment', ?, ?, 0, ?)"
    ).run(
      req.user.id,
      "Appointment Booked",
      `Your appointment with Dr. ${doctor.name} on ${date} at ${time} has been confirmed.`,
      new Date().toISOString()
    );

    const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ appointment: publicAppointment(row) });
  } catch (err) {
    serverError(res, err, "Failed to book appointment");
  }
});

// PUT /api/appointments/:id/cancel
router.put("/:id/cancel", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM appointments WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Appointment not found" });
    db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to cancel appointment");
  }
});

// PUT /api/appointments/:id/reschedule
router.put("/:id/reschedule", requireAuth, (req, res) => {
  try {
    const { date, time } = req.body || {};
    const row = db
      .prepare("SELECT * FROM appointments WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Appointment not found" });
    if (!date && !time) {
      return res.status(400).json({ message: "Provide a new date or time" });
    }
    db.prepare("UPDATE appointments SET date = ?, time = ?, status = 'scheduled' WHERE id = ?").run(
      date ?? row.date,
      time ?? row.time,
      row.id
    );
    const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(row.id);
    res.json({ appointment: publicAppointment(updated) });
  } catch (err) {
    serverError(res, err, "Failed to reschedule appointment");
  }
});

export default router;
