import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

export function listAllDoctors() {
  const accounts = db
    .prepare("SELECT id, name, email, created_at FROM users WHERE role = 'doctor' ORDER BY created_at DESC")
    .all();
  const profiles = db.prepare("SELECT * FROM doctors ORDER BY name ASC").all();

  const accountsByEmail = new Map(
    accounts.map((u) => [String(u.email || "").toLowerCase(), u])
  );
  const matchedAccountIds = new Set();

  const list = profiles.map((p) => {
    const account = p.email
      ? accountsByEmail.get(String(p.email).toLowerCase())
      : null;
    if (account) matchedAccountIds.add(account.id);
    return {
      key: `profile-${p.id}`,
      name: p.name,
      specialty: p.specialty,
      hospital: p.hospital,
      email: p.email,
      phone: p.phone || null,
      image: p.image || null,
      rating: p.rating,
      patients: p.patients,
      available: !!p.available,
      signedUp: !!account,
      joinedAt: account ? account.created_at : p.created_at,
    };
  });

  for (const u of accounts) {
    if (matchedAccountIds.has(u.id)) continue;
    list.push({
      key: `user-${u.id}`,
      name: u.name,
      specialty: null,
      hospital: null,
      email: u.email,
      phone: null,
      image: null,
      rating: null,
      patients: 0,
      available: false,
      signedUp: true,
      joinedAt: u.created_at,
    });
  }

  list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return list;
}

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

// GET /api/doctors/all (admin) — must be registered before /:id
router.get("/all", requireAuth, requireRole("admin"), (req, res) => {
  try {
    const data = listAllDoctors();
    res.json({
      data,
      total: data.length,
      signedUp: data.filter((d) => d.signedUp).length,
    });
  } catch (err) {
    serverError(res, err, "Failed to fetch all doctors");
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
