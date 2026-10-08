import jwt from "jsonwebtoken";
import db from "./db.js";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Set it in your .env file or environment."
  );
}
export const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user.id, type: "refresh" }, JWT_SECRET, { expiresIn: "30d" });
}

function isTokenRevoked(token) {
  const row = db.prepare("SELECT 1 FROM revoked_tokens WHERE token = ?").get(token);
  return !!row;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (isTokenRevoked(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
