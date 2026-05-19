"use strict";

const connectedSockets = new Set();

function initSocket(io) {
  io.on("connection", (socket) => {
    if (connectedSockets.has(socket.id)) {
      socket.disconnect(true);
      return;
    }

    connectedSockets.add(socket.id);
    const clientCount = io.engine.clientsCount;
    console.log(`🔌 [Socket] Client connected: ${socket.id} | Total: ${clientCount}`);
    io.emit("client_count", clientCount);

    socket.on("join_feeds", () => {
      socket.join("feeds");
      console.log(`📡 [Socket] ${socket.id} joined feeds room`);
    });

    socket.on("disconnect", (reason) => {
      connectedSockets.delete(socket.id);
      const remaining = io.engine.clientsCount;
      console.log(`🔌 [Socket] Disconnected: ${socket.id} | Reason: ${reason} | Remaining: ${remaining}`);
      io.emit("client_count", remaining);
    });
  });
}

module.exports = { initSocket };
