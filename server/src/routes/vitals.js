import { Router } from "express";
import db, { ensureDemoVitals } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function publicVitals(row) {
  return {
    id: row.id,
    systolic: row.systolic,
    diastolic: row.diastolic,
    heartRate: row.heart_rate,
    weightKg: row.weight_kg,
    heightCm: row.height_cm,
    bmi: row.bmi,
    measuredAt: row.measured_at,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/vitals/latest
router.get("/latest", requireAuth, (req, res) => {
  try {
    ensureDemoVitals(req.user.id);
    const row = db
      .prepare("SELECT * FROM health_metrics WHERE user_id = ? ORDER BY measured_at DESC LIMIT 1")
      .get(req.user.id);
    if (!row) {
      return res.status(404).json({ message: "No health data recorded yet" });
    }
    res.json({ vitals: publicVitals(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch latest vitals");
  }
});

// GET /api/vitals
router.get("/", requireAuth, (req, res) => {
  try {
    ensureDemoVitals(req.user.id);
    const { limit } = req.query;
    let sql = "SELECT * FROM health_metrics WHERE user_id = ? ORDER BY measured_at DESC";
    const params = [req.user.id];
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const rows = db.prepare(sql).all(...params);
    const data = rows.map(publicVitals);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch vitals");
  }
});

// POST /api/vitals
router.post("/", requireAuth, (req, res) => {
  try {
    const { systolic, diastolic, heartRate, weightKg, heightCm, bmi, measuredAt } = req.body || {};

    let finalBmi = bmi ?? null;
    if (finalBmi == null && weightKg != null && heightCm != null && heightCm > 0) {
      const heightM = heightCm / 100;
      finalBmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    }

    const result = db
      .prepare(
        "INSERT INTO health_metrics (user_id, systolic, diastolic, heart_rate, weight_kg, height_cm, bmi, measured_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        req.user.id,
        systolic ?? null,
        diastolic ?? null,
        heartRate ?? null,
        weightKg ?? null,
        heightCm ?? null,
        finalBmi,
        measuredAt || new Date().toISOString(),
        new Date().toISOString()
      );

    const row = db.prepare("SELECT * FROM health_metrics WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ vitals: publicVitals(row) });
  } catch (err) {
    serverError(res, err, "Failed to save vitals");
  }
});

export default router;