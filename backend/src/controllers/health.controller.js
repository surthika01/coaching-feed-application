"use strict";

// GET /health
function getHealth(_req, res) {
  const io = _req.app.get("io");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    connections: io ? io.engine.clientsCount : 0,
  });
}

module.exports = { getHealth };
