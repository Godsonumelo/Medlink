import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

// GET /api/users (admin only)
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  try {
    const rows = db
      .prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
      .all();
    const counts = db
      .prepare("SELECT role, COUNT(*) AS c FROM users GROUP BY role")
      .all();
    const roleCounts = {};
    for (const r of counts) roleCounts[r.role] = r.c;

    res.json({
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.created_at,
      })),
      total: rows.length,
      roleCounts,
    });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;
