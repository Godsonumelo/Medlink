import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function ensureUserSettings(userId) {
  const exists = db.prepare("SELECT user_id FROM user_settings WHERE user_id = ?").get(userId);
  if (!exists) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);
  }
}

function publicSettings(row) {
  return {
    notifications: {
      appointments: !!row.notify_appointments,
      reminders: !!row.notify_reminders,
      promotions: !!row.notify_promotions,
      security: !!row.notify_security,
    },
    privacy: {
      profilePublic: !!row.privacy_profile_public,
      shareData: !!row.privacy_share_data,
      analytics: !!row.privacy_analytics,
    },
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

// GET /api/settings/notifications
router.get("/notifications", requireAuth, (req, res) => {
  try {
    ensureUserSettings(req.user.id);
    const row = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    res.json({ settings: publicSettings(row).notifications });
  } catch (err) {
    serverError(res, err, "Failed to fetch notification settings");
  }
});

// PUT /api/settings/notifications
router.put("/notifications", requireAuth, (req, res) => {
  try {
    const {
      appointments,
      reminders,
      promotions,
      security,
    } = req.body || {};
    ensureUserSettings(req.user.id);
    const row = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    db.prepare(
      "UPDATE user_settings SET notify_appointments = ?, notify_reminders = ?, notify_promotions = ?, notify_security = ? WHERE user_id = ?"
    ).run(
      appointments === undefined ? row.notify_appointments : Number(!!appointments),
      reminders === undefined ? row.notify_reminders : Number(!!reminders),
      promotions === undefined ? row.notify_promotions : Number(!!promotions),
      security === undefined ? row.notify_security : Number(!!security),
      req.user.id
    );
    const updated = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    res.json({ settings: publicSettings(updated).notifications });
  } catch (err) {
    serverError(res, err, "Failed to update notification settings");
  }
});

// GET /api/settings/privacy
router.get("/privacy", requireAuth, (req, res) => {
  try {
    ensureUserSettings(req.user.id);
    const row = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    res.json({ settings: publicSettings(row).privacy });
  } catch (err) {
    serverError(res, err, "Failed to fetch privacy settings");
  }
});

// PUT /api/settings/privacy
router.put("/privacy", requireAuth, (req, res) => {
  try {
    const { profilePublic, shareData, analytics } = req.body || {};
    ensureUserSettings(req.user.id);
    const row = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    db.prepare(
      "UPDATE user_settings SET privacy_profile_public = ?, privacy_share_data = ?, privacy_analytics = ? WHERE user_id = ?"
    ).run(
      profilePublic === undefined ? row.privacy_profile_public : Number(!!profilePublic),
      shareData === undefined ? row.privacy_share_data : Number(!!shareData),
      analytics === undefined ? row.privacy_analytics : Number(!!analytics),
      req.user.id
    );
    const updated = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.user.id);
    res.json({ settings: publicSettings(updated).privacy });
  } catch (err) {
    serverError(res, err, "Failed to update privacy settings");
  }
});

// DELETE /api/settings/account
router.delete("/account", requireAuth, (req, res) => {
  try {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.user.id);
    if (result.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to delete account");
  }
});

export default router;
