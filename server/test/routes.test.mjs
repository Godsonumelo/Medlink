import { createServer } from "node:http";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_secret_for_routes_test";
}

const { default: app, closeRateLimitTimer } = await import("../src/app.js");

const results = [];
let failed = 0;

function check(name, condition, extra = "") {
  const status = condition ? "PASS" : "FAIL";
  if (!condition) failed++;
  results.push(`${status}: ${name}${extra ? ` (${extra})` : ""}`);
  console.log(`${status}: ${name}${extra ? ` (${extra})` : ""}`);
}

const server = createServer(app);
server.listen(0, async () => {
  try {
    const port = server.address().port;
    const base = `http://localhost:${port}`;

    // Public doctors
    const docsRes = await fetch(`${base}/api/doctors?limit=4`);
    const docs = await docsRes.json();
    check("GET /api/doctors returns 200", docsRes.status === 200);
    check("GET /api/doctors returns data array", Array.isArray(docs.data), `count=${docs.data?.length}`);
    check("GET /api/doctors total > 0", docs.total > 0);
    check("GET /api/doctors has doctor fields", !!docs.data?.[0]?.name && !!docs.data?.[0]?.specialty);

    // Doctor by id
    const docId = docs.data[0].id;
    const docRes = await fetch(`${base}/api/doctors/${docId}`);
    const doc = await docRes.json();
    check("GET /api/doctors/:id returns 200", docRes.status === 200);
    check("GET /api/doctors/:id returns doctor", doc.doctor?.name === docs.data[0].name);

    // Search
    const searchRes = await fetch(`${base}/api/doctors/search?q=cardio`);
    const search = await searchRes.json();
    check("GET /api/doctors/search returns 200", searchRes.status === 200);

    // Specialty
    const specRes = await fetch(`${base}/api/doctors/specialty/Cardiology`);
    const spec = await specRes.json();
    check("GET /api/doctors/specialty/:spec returns 200", specRes.status === 200);
    check("specialty search matches", spec.data?.every?.((d) => d.specialty === "Cardiology"));

    // Reviews & availability
    const revRes = await fetch(`${base}/api/doctors/${docId}/reviews`);
    const rev = await revRes.json();
    check("GET /api/doctors/:id/reviews returns 200", revRes.status === 200);
    const availRes = await fetch(`${base}/api/doctors/${docId}/availability`);
    const avail = await availRes.json();
    check("GET /api/doctors/:id/availability returns 200", availRes.status === 200);
    check("availability has data", avail.data?.length > 0);

    // Hospitals
    const hospRes = await fetch(`${base}/api/hospitals?limit=4`);
    const hosp = await hospRes.json();
    check("GET /api/hospitals returns 200", hospRes.status === 200);
    check("hospitals total > 0", hosp.total > 0);
    const hospId = hosp.data[0].id;
    const hospDoctorsRes = await fetch(`${base}/api/hospitals/${hospId}/doctors`);
    check("GET /api/hospitals/:id/doctors returns 200", hospDoctorsRes.status === 200);
    const nearbyRes = await fetch(`${base}/api/hospitals/nearby?lat=6.5&lng=3.3&radius=500`);
    check("GET /api/hospitals/nearby returns 200", nearbyRes.status === 200);

    // Register a test user for authed routes
    const email = `route_${Date.now()}@example.com`;
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Route Tester", email, password: "Password123!" }),
    });
    const reg = await regRes.json();
    check("register test user", regRes.status === 201 && !!reg.token);
    const auth = { Authorization: `Bearer ${reg.token}` };

    // Appointments
    const aptUpRes = await fetch(`${base}/api/appointments/upcoming`, { headers: auth });
    const aptUp = await aptUpRes.json();
    check("GET /api/appointments/upcoming returns 200", aptUpRes.status === 200);
    check("appointments/upcoming returns data", Array.isArray(aptUp.data));

    // Book appointment
    const bookRes = await fetch(`${base}/api/appointments`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: docId, date: "2026-10-01", time: "10:00", type: "Consultation" }),
    });
    const book = await bookRes.json();
    check("POST /api/appointments returns 201", bookRes.status === 201, `status=${bookRes.status}`);
    check("appointment created", !!book.appointment?.id);
    if (book.appointment?.id) {
      const changeRes = await fetch(`${base}/api/appointments/${book.appointment.id}/reschedule`, {
        method: "PUT",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ time: "14:00" }),
      });
      check("reschedule returns 200", changeRes.status === 200, `status=${changeRes.status}`);
    }
    const pastRes = await fetch(`${base}/api/appointments/past`, { headers: auth });
    check("GET /api/appointments/past returns 200", pastRes.status === 200);

    // Records
    const recRes = await fetch(`${base}/api/records`, { headers: auth });
    const rec = await recRes.json();
    check("GET /api/records returns 200", recRes.status === 200);
    const recCreateRes = await fetch(`${base}/api/records`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Lab Results", category: "Lab", description: "Annual bloodwork" }),
    });
    const recCreate = await recCreateRes.json();
    check("POST /api/records returns 201", recCreateRes.status === 201, `status=${recCreateRes.status}`);
    if (recCreate.record?.id) {
      const recGetRes = await fetch(`${base}/api/records/${recCreate.record.id}`, { headers: auth });
      check("GET /api/records/:id returns 200", recGetRes.status === 200);
    }
    const recAll2 = await fetch(`${base}/api/records?limit=5`, { headers: auth });
    const rec2 = await recAll2.json();
    check("records with limit", Array.isArray(rec2.data));

    // Prescriptions
    const preRes = await fetch(`${base}/api/prescriptions`, { headers: auth });
    check("GET /api/prescriptions returns 200", preRes.status === 200);
    const preCreateRes = await fetch(`${base}/api/prescriptions`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ medication: "Amoxicillin", dosage: "500mg", frequency: "3x daily" }),
    });
    check("POST /api/prescriptions returns 201", preCreateRes.status === 201, `status=${preCreateRes.status}`);

    // Notifications
    const notifRes = await fetch(`${base}/api/notifications`, { headers: auth });
    const notif = await notifRes.json();
    check("GET /api/notifications returns 200", notifRes.status === 200);
    check("notifications has booked notification", notif.data?.length > 0);
    const unreadRes = await fetch(`${base}/api/notifications/unread`, { headers: auth });
    check("GET /api/notifications/unread returns 200", unreadRes.status === 200);
    const markAllRes = await fetch(`${base}/api/notifications/read-all`, {
      method: "PUT",
      headers: auth,
    });
    check("PUT /api/notifications/read-all returns 200", markAllRes.status === 200);
    if (notif.data?.[0]?.id) {
      const markOneRes = await fetch(`${base}/api/notifications/${notif.data[0].id}/read`, {
        method: "PUT",
        headers: auth,
      });
      check("mark one read returns 200", markOneRes.status === 200);
    }

    // Settings
    const notifSetRes = await fetch(`${base}/api/settings/notifications`, { headers: auth });
    check("GET /api/settings/notifications returns 200", notifSetRes.status === 200);
    const notifSetUpd = await fetch(`${base}/api/settings/notifications`, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ reminders: false }),
    });
    check("PUT /api/settings/notifications returns 200", notifSetUpd.status === 200);
    const privRes = await fetch(`${base}/api/settings/privacy`, { headers: auth });
    check("GET /api/settings/privacy returns 200", privRes.status === 200);

    // Unauthenticated protection
    const noAuthUp = await fetch(`${base}/api/appointments/upcoming`);
    check("appointments/upcoming without token returns 401", noAuthUp.status === 401);

    console.log(`\n${results.length - failed}/${results.length} tests passed`);
  } catch (err) {
    console.error("Test runner error:", err);
    failed++;
  } finally {
    closeRateLimitTimer();
    server.close(() => process.exit(failed > 0 ? 1 : 0));
  }
});
