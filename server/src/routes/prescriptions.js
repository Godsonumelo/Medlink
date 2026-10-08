import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function publicPrescription(row) {
  let doctor = null;
  if (row.doctor_id) {
    const d = db.prepare("SELECT * FROM doctors WHERE id = ?").get(row.doctor_id);
    if (d) {
      doctor = { id: d.id, name: d.name, specialty: d.specialty };
    }
  }
  return {
    id: row.id,
    doctorId: row.doctor_id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    notes: row.notes,
    createdAt: row.created_at,
    doctor,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/prescriptions
router.get("/", requireAuth, (req, res) => {
  try {
    const { limit } = req.query;
    let sql = "SELECT * FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC";
    const params = [req.user.id];
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const rows = db.prepare(sql).all(...params);
    const data = rows.map(publicPrescription);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch prescriptions");
  }
});

// GET /api/prescriptions/:id
router.get("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM prescriptions WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Prescription not found" });
    res.json({ prescription: publicPrescription(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch prescription");
  }
});

// POST /api/prescriptions
router.post("/", requireAuth, (req, res) => {
  try {
    const { medication, dosage, frequency, duration, notes, doctorId } = req.body || {};
    if (!medication) return res.status(400).json({ message: "medication is required" });
    const result = db
      .prepare(
        "INSERT INTO prescriptions (user_id, doctor_id, medication, dosage, frequency, duration, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        req.user.id,
        doctorId || null,
        medication,
        dosage || null,
        frequency || null,
        duration || null,
        notes || null,
        new Date().toISOString()
      );
    const row = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ prescription: publicPrescription(row) });
  } catch (err) {
    serverError(res, err, "Failed to create prescription");
  }
});

// PUT /api/prescriptions/:id
router.put("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM prescriptions WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Prescription not found" });
    const { medication, dosage, frequency, duration, notes, doctorId } = req.body || {};
    db.prepare(
      "UPDATE prescriptions SET medication = ?, dosage = ?, frequency = ?, duration = ?, notes = ?, doctor_id = ? WHERE id = ?"
    ).run(
      medication ?? row.medication,
      dosage ?? row.dosage,
      frequency ?? row.frequency,
      duration ?? row.duration,
      notes ?? row.notes,
      doctorId ?? row.doctor_id,
      row.id
    );
    const updated = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(row.id);
    res.json({ prescription: publicPrescription(updated) });
  } catch (err) {
    serverError(res, err, "Failed to update prescription");
  }
});

// DELETE /api/prescriptions/:id
router.delete("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM prescriptions WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Prescription not found" });
    db.prepare("DELETE FROM prescriptions WHERE id = ?").run(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to delete prescription");
  }
});

export default router;
