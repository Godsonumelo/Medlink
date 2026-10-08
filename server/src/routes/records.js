import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function publicRecord(row) {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    title: row.title,
    description: row.description,
    category: row.category,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/records
router.get("/", requireAuth, (req, res) => {
  try {
    const { limit, category } = req.query;
    let sql = "SELECT * FROM medical_records WHERE user_id = ?";
    const params = [req.user.id];
    if (category) {
      sql += " AND LOWER(category) = LOWER(?)";
      params.push(category);
    }
    sql += " ORDER BY created_at DESC";
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const rows = db.prepare(sql).all(...params);
    const data = rows.map(publicRecord);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch medical records");
  }
});

// GET /api/records/:id
router.get("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM medical_records WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Record not found" });
    res.json({ record: publicRecord(row) });
  } catch (err) {
    serverError(res, err, "Failed to fetch record");
  }
});

// GET /api/records/:id/download
router.get("/:id/download", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM medical_records WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Record not found" });
    if (!row.file_data) {
      return res.status(404).json({ message: "No file attached to this record" });
    }
    const buffer = row.file_data;
    const fileName = row.file_name || `record_${row.id}`;
    res.setHeader("Content-Type", row.file_type || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    serverError(res, err, "Failed to download record");
  }
});

// POST /api/records
router.post("/", requireAuth, (req, res) => {
  try {
    const { title, description, category, doctorId } = req.body || {};
    if (!title) return res.status(400).json({ message: "title is required" });

    let file = null;
    if (req.is("multipart/form-data")) {
      file = req.files?.file || null;
    }

    const result = db
      .prepare(
        "INSERT INTO medical_records (user_id, doctor_id, title, description, category, file_name, file_type, file_size, file_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        req.user.id,
        doctorId || null,
        title,
        description || null,
        category || "General",
        file?.name || null,
        file?.mimetype || null,
        file?.size || 0,
        file?.data || null,
        new Date().toISOString()
      );
    const row = db.prepare("SELECT * FROM medical_records WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ record: publicRecord(row) });
  } catch (err) {
    serverError(res, err, "Failed to create record");
  }
});

// DELETE /api/records/:id
router.delete("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM medical_records WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Record not found" });
    db.prepare("DELETE FROM medical_records WHERE id = ?").run(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to delete record");
  }
});

export default router;
