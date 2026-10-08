import { createServer } from "node:http";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_secret_for_auth_test";
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

    const health = await fetch(`${base}/api/health`).then((r) => r.json());
    check("health endpoint", health.status === "ok");

    // Register
    const email = `test_${Date.now()}@example.com`;
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: "Password123!" }),
    });
    const reg = await regRes.json();
    check("register returns 201", regRes.status === 201, `status=${regRes.status}`);
    check("register returns token", !!reg.token);
    check("register returns refresh token", !!reg.refreshToken);
    check("register default role is patient", reg.user?.role === "patient");

    // Duplicate register
    const dupRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dup", email, password: "Password123!" }),
    });
    const dup = await dupRes.json();
    check("duplicate register returns 409", dupRes.status === 409, `status=${dupRes.status}`);
    check("duplicate register message", /already exists/.test(dup.message));

    // Weak password rejected
    const weakRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Weak", email: `weak_${Date.now()}@example.com`, password: "123" }),
    });
    const weak = await weakRes.json();
    check("weak password returns 400", weakRes.status === 400, `status=${weakRes.status}`);
    check("weak password message", typeof weak.message === "string");

    // Login
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "Password123!" }),
    });
    const login = await loginRes.json();
    check("login returns 200", loginRes.status === 200);
    check("login returns token", !!login.token);

    // Profile with token
    const profRes = await fetch(`${base}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    const prof = await profRes.json();
    check("profile returns 200", profRes.status === 200);
    check("profile returns correct email", prof.user?.email === email);

    // Profile without token
    const noAuthRes = await fetch(`${base}/api/auth/profile`);
    check("profile without token returns 401", noAuthRes.status === 401);

    // Wrong password
    const badRes = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "wrong" }),
    });
    const bad = await badRes.json();
    check("bad login returns 401", badRes.status === 401, `status=${badRes.status}`);
    check("bad login message", /invalid/i.test(bad.message));

    // Register as DOCTOR should NOT be allowed via public endpoint
    const docEmail = `doc_${Date.now()}@example.com`;
    const docRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dr. Test", email: docEmail, password: "Password123!", role: "doctor" }),
    });
    const doc = await docRes.json();
    check("cannot self-register as doctor", doc.user?.role !== "doctor", `role=${doc.user?.role}`);

    // Register as ADMIN should NOT be allowed via public endpoint
    const adminEmail = `admin_${Date.now()}@example.com`;
    const adminRegRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Test", email: adminEmail, password: "Password123!", role: "admin" }),
    });
    const adminReg = await adminRegRes.json();
    check("cannot self-register as admin", adminReg.user?.role !== "admin", `role=${adminReg.user?.role}`);

    // Logout
    const logoutRes = await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${login.token}` },
    });
    check("logout returns success", (await logoutRes.json()).success === true);

    // Logout requires auth
    const logoutNoAuthRes = await fetch(`${base}/api/auth/logout`, { method: "POST" });
    check("logout without token returns 401", logoutNoAuthRes.status === 401);

    console.log(`\n${results.length - failed}/${results.length} tests passed`);
  } catch (err) {
    console.error("Test runner error:", err);
    failed++;
  } finally {
    closeRateLimitTimer();
    server.close(() => process.exit(failed > 0 ? 1 : 0));
  }
});
