import { Router } from "express";
import db from "../db.js";

const router = Router();

function publicDoctor(row) {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    hospital: row.hospital,
    phone: row.phone,
    email: row.email,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    patients: row.patients,
    available: !!row.available,
    bio: row.bio,
    image: row.image || null,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/doctors
router.get("/", (req, res) => {
  try {
    const { limit, specialty, q } = req.query;
    let sql = "SELECT * FROM doctors";
    const clauses = [];
    const params = [];

    if (specialty) {
      clauses.push("LOWER(specialty) = LOWER(?)");
      params.push(specialty);
    }
    if (q) {
      clauses.push("(LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(hospital) LIKE ?)");
      params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
    }
    if (clauses.length) {
      sql += " WHERE " + clauses.join(" AND ");
    }
    sql += " ORDER BY rating DESC";
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }

    const rows = db.prepare(sql).all(...params);
    const data = rows.map(publicDoctor);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch doctors");
  }
});

// GET /api/doctors/search
router.get("/search", (req, res) => {
  try {
    const q = req.query.q || "";
    const rows = db
      .prepare(
        "SELECT * FROM doctors WHERE LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(hospital) LIKE ? ORDER BY rating DESC"
      )
      .all(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
    const data = rows.map(publicDoctor);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to search doctors");
  }
});

// GET /api/doctors/specialty/:specialty
router.get("/specialty/:specialty", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM doctors WHERE LOWER(specialty) = LOWER(?) ORDER BY rating DESC")
      .all(req.params.specialty);
    const data = rows.map(publicDoctor);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch doctors by specialty");
  }
});

// GET /api/doctors/:id/reviews
router.get("/:id/reviews", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM reviews WHERE doctor_id = ? ORDER BY created_at DESC")
      .all(req.params.id);
    const data = rows.map((r) => ({
      id: r.id,
      doctorId: r.doctor_id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch reviews");
  }
});

// GET /api/doctors/:id/availability
router.get("/:id/availability", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM availability WHERE doctor_id = ? ORDER BY day")
      .all(req.params.id);
    const data = rows.map((a) => ({
      id: a.id,
      doctorId: a.doctor_id,
      day: a.day,
      startTime: a.start_time,
      endTime: a.end_time,
    }));
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch availability");
  }
});

// GET /api/doctors/:id
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor: publicDoctor(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch doctor");
  }
});

export default router;
