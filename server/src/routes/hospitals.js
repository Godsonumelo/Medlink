import { Router } from "express";
import db from "../db.js";

const router = Router();

function publicHospital(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    phone: row.phone,
    email: row.email,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating,
    established: row.established,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/hospitals
router.get("/", (req, res) => {
  try {
    const { limit, city, q } = req.query;
    let sql = "SELECT * FROM hospitals";
    const clauses = [];
    const params = [];

    if (city) {
      clauses.push("LOWER(city) = LOWER(?)");
      params.push(city);
    }
    if (q) {
      clauses.push("(LOWER(name) LIKE ? OR LOWER(city) LIKE ?)");
      params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
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
    const data = rows.map(publicHospital);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch hospitals");
  }
});

// GET /api/hospitals/nearby
router.get("/nearby", (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 30; // km

    const rows = db.prepare("SELECT * FROM hospitals").all();
    const earthRadius = 6371;
    const data = rows
      .map((h) => {
        const dLat = ((h.latitude || 0) - lat) * (Math.PI / 180);
        const dLng = ((h.longitude || 0) - lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat * (Math.PI / 180)) *
            Math.cos((h.latitude || 0) * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2;
        const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...publicHospital(h), distance: Math.round(distance * 10) / 10 };
      })
      .filter((h) => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch nearby hospitals");
  }
});

// GET /api/hospitals/:id/doctors
router.get("/:id/doctors", (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT d.* FROM doctors d
         JOIN doctor_hospital dh ON dh.doctor_id = d.id
         WHERE dh.hospital_id = ?`
      )
      .all(req.params.id);
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      specialty: r.specialty,
      rating: r.rating,
      patients: r.patients,
    }));
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch hospital doctors");
  }
});

// GET /api/hospitals/:id
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM hospitals WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ message: "Hospital not found" });
    res.json({ hospital: publicHospital(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch hospital");
  }
});

export default router;
