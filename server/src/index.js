import app, { closeRateLimitTimer } from "./app.js";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`MedLink API listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. A MedLink API server may already be running. `
    );
    console.error(`Kill the process holding port ${PORT} or change PORT in server/.env, then try again.`);
    process.exit(1);
  }
  throw err;
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  closeRateLimitTimer();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
