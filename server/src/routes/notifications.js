import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function publicNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: !!row.read,
    createdAt: row.created_at,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/notifications
router.get("/", requireAuth, (req, res) => {
  try {
    const { limit } = req.query;
    let sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    const params = [req.user.id];
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const rows = db.prepare(sql).all(...params);
    const data = rows.map(publicNotification);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch notifications");
  }
});

// GET /api/notifications/unread
router.get("/unread", requireAuth, (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC")
      .all(req.user.id);
    const data = rows.map(publicNotification);
    res.json({ data, total: data.length });
  } catch (err) {
    serverError(res, err, "Failed to fetch unread notifications");
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Notification not found" });
    db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to mark notification as read");
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", requireAuth, (req, res) => {
  try {
    db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to mark all notifications as read");
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", requireAuth, (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ message: "Notification not found" });
    db.prepare("DELETE FROM notifications WHERE id = ?").run(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to delete notification");
  }
});

// DELETE /api/notifications
router.delete("/", requireAuth, (req, res) => {
  try {
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to delete all notifications");
  }
});

export default router;
