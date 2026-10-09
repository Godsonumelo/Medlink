import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, "medlink.db");

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS revoked_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    patients INTEGER DEFAULT 0,
    available INTEGER DEFAULT 1,
    bio TEXT,
    image TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nigeria',
    phone TEXT,
    email TEXT,
    latitude REAL,
    longitude REAL,
    rating REAL DEFAULT 0,
    established INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    hospital_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Consultation',
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER DEFAULT 0,
    file_data BLOB,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER,
    medication TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    notify_appointments INTEGER NOT NULL DEFAULT 1,
    notify_reminders INTEGER NOT NULL DEFAULT 1,
    notify_promotions INTEGER NOT NULL DEFAULT 0,
    notify_security INTEGER NOT NULL DEFAULT 1,
    privacy_profile_public INTEGER NOT NULL DEFAULT 0,
    privacy_share_data INTEGER NOT NULL DEFAULT 0,
    privacy_analytics INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS doctor_hospital (
    doctor_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    PRIMARY KEY (doctor_id, hospital_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    user_id INTEGER,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL DEFAULT '09:00',
    end_time TEXT NOT NULL DEFAULT '17:00',
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS health_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    weight_kg REAL,
    height_cm REAL,
    bmi REAL,
    measured_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
  CREATE INDEX IF NOT EXISTS idx_records_user ON medical_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON reviews(doctor_id);
  CREATE INDEX IF NOT EXISTS idx_health_metrics_user ON health_metrics(user_id);
`);

// Migration: add expires_at and user_id columns to revoked_tokens if missing
const revokedColumns = db
  .prepare("PRAGMA table_info(revoked_tokens)")
  .all()
  .map((c) => c.name);

if (!revokedColumns.includes("expires_at")) {
  db.exec("ALTER TABLE revoked_tokens ADD COLUMN expires_at TEXT NOT NULL DEFAULT ''");
}
if (!revokedColumns.includes("user_id")) {
  db.exec("ALTER TABLE revoked_tokens ADD COLUMN user_id INTEGER");
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user ON revoked_tokens(user_id);
`);

const doctorColumns = db
  .prepare("PRAGMA table_info(doctors)")
  .all()
  .map((c) => c.name);

if (!doctorColumns.includes("image")) {
  db.exec('ALTER TABLE doctors ADD COLUMN image TEXT');
}

function seed() {
  const doctorCount = db.prepare("SELECT COUNT(*) AS c FROM doctors").get().c;
  if (doctorCount > 0) return;

  const now = new Date().toISOString();
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialty, hospital, phone, email, rating, reviews_count, patients, available, bio, image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const doctors = [
    { name: "Dr. Anna Lee", specialty: "Cardiology", hospital: "City General Hospital", phone: "+2348010000001", email: "anna.lee@medlink.com", rating: 4.8, reviews: 42, patients: 320, bio: "Board-certified cardiologist with over 12 years of experience in preventive and interventional cardiology.", image: "/images/doctors/doctor-1.jpg" },
    { name: "Dr. John Doe", specialty: "General Practice", hospital: "Lagos University Teaching Hospital", phone: "+2348010000002", email: "john.doe@medlink.com", rating: 4.6, reviews: 28, patients: 410, bio: "Compassionate family physician focused on comprehensive primary care for all ages.", image: "/images/doctors/doctor-2.jpg" },
    { name: "Dr. Sarah Nwosu", specialty: "Pediatrics", hospital: "National Hospital Abuja", phone: "+2348010000003", email: "sarah.nwosu@medlink.com", rating: 4.9, reviews: 55, patients: 290, bio: "Pediatric specialist dedicated to the health and wellbeing of children from infancy through adolescence.", image: "/images/doctors/doctor-3.jpg" },
    { name: "Dr. David Okafor", specialty: "Orthopedics", hospital: "City General Hospital", phone: "+2348010000004", email: "david.okafor@medlink.com", rating: 4.7, reviews: 33, patients: 265, bio: "Orthopedic surgeon specializing in sports injuries, joint replacement, and trauma care.", image: "/images/doctors/doctor-4.jpg" },
    { name: "Dr. Mary Adeyemi", specialty: "Dermatology", hospital: "Dermatology & Aesthetics Clinic", phone: "+2348010000005", email: "mary.adeyemi@medlink.com", rating: 4.5, reviews: 21, patients: 180, bio: "Clinical dermatologist with expertise in medical, surgical, and cosmetic dermatology.", image: "/images/doctors/doctor-1.jpg" },
    { name: "Dr. Peter Eze", specialty: "Neurology", hospital: "National Hospital Abuja", phone: "+2348010000006", email: "peter.eze@medlink.com", rating: 4.8, reviews: 37, patients: 210, bio: "Neurologist focused on the diagnosis and treatment of disorders of the nervous system.", image: "/images/doctors/doctor-2.jpg" },
  ];

  const doctorIds = [];
  for (const d of doctors) {
    const result = insertDoctor.run(d.name, d.specialty, d.hospital, d.phone, d.email, d.rating, d.reviews, d.patients, 1, d.bio, d.image, now);
    doctorIds.push(result.lastInsertRowid);
  }

  const hospitalRows = [
    { name: "City General Hospital", address: "12 Broad Street", city: "Lagos", state: "Lagos", phone: "+2348020000001", email: "info@citygeneral.com", lat: 6.5244, lng: 3.3792, rating: 4.6, established: 1998 },
    { name: "Lagos University Teaching Hospital", address: "1 Idi-Araba Road", city: "Lagos", state: "Lagos", phone: "+2348020000002", email: "contact@luth.org.ng", lat: 6.5244, lng: 3.3792, rating: 4.7, established: 1961 },
    { name: "National Hospital Abuja", address: "Central Business District", city: "Abuja", state: "FCT", phone: "+2348020000003", email: "info@nationalhospital.gov.ng", lat: 9.035, lng: 7.497, rating: 4.5, established: 1999 },
    { name: "Dermatology & Aesthetics Clinic", address: "45 Marina Road", city: "Lagos", state: "Lagos", phone: "+2348020000004", email: "care@dermaclinic.ng", lat: 6.4531, lng: 3.3958, rating: 4.8, established: 2015 },
    { name: "MedLink Partner Hospital", address: "8 University Road", city: "Ibadan", state: "Oyo", phone: "+2348020000005", email: "hello@medlinkhospital.com", lat: 7.3775, lng: 3.947, rating: 4.4, established: 2010 },
  ];

  const insertHospital = db.prepare(`
    INSERT INTO hospitals (name, address, city, state, country, phone, email, latitude, longitude, rating, established, created_at)
    VALUES (?, ?, ?, ?, 'Nigeria', ?, ?, ?, ?, ?, ?, ?)
  `);
  const hospitalIds = [];
  for (const h of hospitalRows) {
    const result = insertHospital.run(h.name, h.address, h.city, h.state, h.phone, h.email, h.lat, h.lng, h.rating, h.established, now);
    hospitalIds.push(result.lastInsertRowid);
  }

  const link = db.prepare("INSERT OR IGNORE INTO doctor_hospital (doctor_id, hospital_id) VALUES (?, ?)");
  for (let i = 0; i < doctorIds.length; i++) {
    db.prepare("UPDATE doctors SET hospital = (SELECT name FROM hospitals WHERE id = ?) WHERE id = ?").run(hospitalIds[i % hospitalIds.length], doctorIds[i]);
    link.run(doctorIds[i], hospitalIds[i % hospitalIds.length]);
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const insertAvail = db.prepare("INSERT INTO availability (doctor_id, day, start_time, end_time) VALUES (?, ?, '09:00', '17:00')");
  for (const docId of doctorIds) {
    for (const day of days) {
      insertAvail.run(docId, day);
    }
  }

  const insertReview = db.prepare("INSERT INTO reviews (doctor_id, user_id, rating, comment, created_at) VALUES (?, NULL, ?, ?, ?)");
  const sampleComments = [
    "Very professional and thorough. Highly recommend.",
    "Great doctor, very knowledgeable and caring.",
    "Excellent care and follow up. Felt completely at ease.",
    "Listened to all my concerns and explained everything clearly.",
    "Amazing experience from start to finish.",
  ];
  for (const docId of doctorIds) {
    insertReview.run(docId, 5, sampleComments[0], now);
    insertReview.run(docId, 4, sampleComments[1], now);
    insertReview.run(docId, 5, sampleComments[2], now);
  }

  console.log("Seeded database with doctors, hospitals, availability, and reviews");
}

function seedHealthMetrics() {
  const users = db.prepare("SELECT id FROM users ORDER BY id").all();
  let seeded = 0;
  for (const u of users) {
    if (seedDemoVitals(u.id)) {
      seeded += 1;
    }
  }
  if (seeded > 0) {
    console.log(`Seeded health metrics for ${seeded} user(s)`);
  }
}

export function ensureDemoVitals(userId) {
  const hasVitals = db
    .prepare("SELECT COUNT(*) AS c FROM health_metrics WHERE user_id = ?")
    .get(userId).c;
  if (hasVitals > 0) return false;
  return seedDemoVitals(userId);
}

function seedDemoVitals(userId) {
  const insert = db.prepare(`
    INSERT INTO health_metrics (user_id, systolic, diastolic, heart_rate, weight_kg, height_cm, bmi, measured_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = Date.now();
  const readings = [
    { systolic: 118, diastolic: 78, heartRate: 74, weight: 71.5, offsetDays: 21 },
    { systolic: 122, diastolic: 82, heartRate: 76, weight: 70.8, offsetDays: 7 },
    { systolic: 120, diastolic: 80, heartRate: 72, weight: 70, bmi: 24.1, offsetDays: 0 },
  ];
  for (const r of readings) {
    const measured = new Date(now - r.offsetDays * 86400000).toISOString();
    insert.run(userId, r.systolic, r.diastolic, r.heartRate, r.weight, null, r.bmi ?? null, measured, measured);
  }
  return true;
}

seed();
seedHealthMetrics();

export default db;
