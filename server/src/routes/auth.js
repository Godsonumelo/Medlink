import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import db from "../db.js";
import {
  requireAuth,
  signToken,
  signRefreshToken,
  JWT_SECRET,
} from "../auth.js";
import jwt from "jsonwebtoken";

const router = Router();

function validatePasswordStrength(password) {
  if (!password || typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function findUserByEmail(email) {
  if (!email) return undefined;
  return db
    .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email);
}

function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function authResponse(row) {
  const user = publicUser(row);
  return {
    token: signToken(row),
    refreshToken: signRefreshToken(row),
    user,
  };
}

function serverError(res, err, message) {
  console.error(`${message}:`, err);
  res.status(500).json({ message });
}

function revokeUserTokens(userId) {
  db.prepare("DELETE FROM revoked_tokens WHERE user_id = ?").run(userId);
}

function cleanupExpiredTokens() {
  const now = new Date().toISOString();
  db.prepare("DELETE FROM revoked_tokens WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM reset_tokens WHERE expires_at < ?").run(now);
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const validRoles = ["patient"];
    const selectedRole = validRoles.includes(role) ? role : "patient";
    const hashed = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(name, email, hashed, selectedRole, new Date().toISOString());
    const row = findUserById(result.lastInsertRowid);
    res.status(201).json(authResponse(row));
  } catch (err) {
    serverError(res, err, "Registration failed");
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const row = findUserByEmail(email);
    if (!row || !(await bcrypt.compare(password || "", row.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json(authResponse(row));
  } catch (err) {
    serverError(res, err, "Login failed");
  }
});

// POST /api/auth/logout
router.post("/logout", requireAuth, (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.decode(token);
      const expiresAt = new Date(payload.exp * 1000).toISOString();
      db.prepare("INSERT INTO revoked_tokens (token, user_id, expires_at) VALUES (?, ?, ?)")
        .run(token, payload?.id ?? null, expiresAt);
    } catch (err) {
      console.error("Failed to revoke token:", err);
    }
  }
  res.json({ success: true });
});

// GET /api/auth/profile
router.get("/profile", requireAuth, (req, res) => {
  const row = findUserById(req.user.id);
  if (!row) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(row) });
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body || {};
    const current = findUserById(req.user.id);
    if (!current) return res.status(404).json({ message: "User not found" });

    const newName = name ?? current.name;
    let newEmail = email ?? current.email;
    if (newEmail && newEmail !== current.email) {
      const existing = findUserByEmail(newEmail);
      if (existing && existing.id !== current.id) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(
      newName,
      newEmail,
      current.id
    );
    const row = findUserById(current.id);
    res.json({ user: publicUser(row) });
  } catch (err) {
    serverError(res, err, "Update failed");
  }
});

// PUT /api/auth/password
router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const row = findUserById(req.user.id);
    if (!row) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(currentPassword || "", row.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const newPasswordError = validatePasswordStrength(newPassword);
    if (newPasswordError) {
      return res.status(400).json({ message: newPasswordError });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, row.id);
    revokeUserTokens(row.id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Password update failed");
  }
});

// POST /api/auth/forgot-password
const lastResetEmail = new Map();

router.post("/forgot-password", (req, res) => {
  try {
    const { email } = req.body || {};
    const row = findUserByEmail(email);
    if (row) {
      const lastSent = lastResetEmail.get(row.email) || 0;
      if (Date.now() - lastSent < 5 * 60 * 1000) {
        return res.json({ success: true });
      }
      cleanupExpiredTokens();
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
      db.prepare(
        "INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
      ).run(row.id, token, expiresAt);
      lastResetEmail.set(row.email, Date.now());
    }
    // Always return success to avoid leaking which emails exist.
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Failed to request password reset");
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    const row = db
      .prepare("SELECT * FROM reset_tokens WHERE token = ?")
      .get(token);
    if (!row || new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    const hashed = await bcrypt.hash(password, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, row.user_id);
    db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token);
    revokeUserTokens(row.user_id);
    res.json({ success: true });
  } catch (err) {
    serverError(res, err, "Password reset failed");
  }
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });
  try {
    const revoked = db.prepare("SELECT 1 FROM revoked_tokens WHERE token = ?").get(refreshToken);
    if (revoked) {
      return res.status(401).json({ message: "Refresh token has been revoked" });
    }
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const row = findUserById(payload.id);
    if (!row) return res.status(401).json({ message: "User not found" });
    res.json({ token: signToken(row), refreshToken: signRefreshToken(row) });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/google | /api/auth/apple (mock social login)
router.post("/google", async (req, res) => {
  try {
    const { token: socialToken } = req.body || {};
    if (!socialToken) {
      return res.status(400).json({ message: "Social token is required" });
    }
    const email = `google_${socialToken.slice(0, 8)}@medlink.com`;
    let existing = findUserByEmail(email);
    if (existing) {
      return res.json(authResponse(existing));
    }
    const password = crypto.randomBytes(16).toString("hex");
    const hashed = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'patient', ?)")
      .run("Google User", email, hashed, new Date().toISOString());
    res.status(201).json(authResponse(findUserById(result.lastInsertRowid)));
  } catch (err) {
    serverError(res, err, "Google sign-in failed");
  }
});

router.post("/apple", async (req, res) => {
  try {
    const { token: socialToken } = req.body || {};
    if (!socialToken) {
      return res.status(400).json({ message: "Social token is required" });
    }
    const email = `apple_${socialToken.slice(0, 8)}@medlink.com`;
    let existing = findUserByEmail(email);
    if (existing) {
      return res.json(authResponse(existing));
    }
    const password = crypto.randomBytes(16).toString("hex");
    const hashed = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'patient', ?)")
      .run("Apple User", email, hashed, new Date().toISOString());
    res.status(201).json(authResponse(findUserById(result.lastInsertRowid)));
  } catch (err) {
    serverError(res, err, "Apple sign-in failed");
  }
});

export default router;
