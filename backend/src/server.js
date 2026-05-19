"use strict";

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { db, initDatabase } = require("./config/db");
const { redis } = require("./config/redis");
const { initSocket } = require("./sockets/socket.handler");

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
  pingTimeout: 30000,
  pingInterval: 10000,
});

app.set("io", io);

initSocket(io);

async function gracefulShutdown(signal) {
  console.log(`\n🛑 [Server] Received ${signal} — shutting down gracefully...`);
  io.close(() => console.log("🔌 [Socket] All sockets closed"));
  await db.end().catch(() => { });
  redis.disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Bootstrap
(async () => {
  try {
    // Connect Redis (optional — silently fails if unavailable)
    try {
      await redis.connect();
    } catch { }

    // Connect & initialise PostgreSQL
    await db.query("SELECT 1");
    console.log("✅ [DB] PostgreSQL connected");
    await initDatabase();

    // Start server
    server.listen(PORT, () => {
      console.log("─────────────────────────────────────────────");
      console.log(`🚀 [Server] Running on http://localhost:${PORT}`);
      console.log(`🔴 [Redis]  ${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`);
      console.log(`🐘 [DB]     ${process.env.PGHOST || "localhost"}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || "coaching_feed"}`);
      console.log(`🌐 [CORS]   Allowing: ${CLIENT_URL}`);
      console.log("─────────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ [Server] Failed to start:", err.message);
    process.exit(1);
  }
})();
