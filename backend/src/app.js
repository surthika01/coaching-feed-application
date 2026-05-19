"use strict";

const express = require("express");
const cors = require("cors");

const feedRoutes = require("./routes/feed.routes");
const healthRoutes = require("./routes/health.routes");
const reactionRoutes = require("./routes/reaction.routes");
const commentRoutes = require("./routes/comment.routes");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();

// Middleware
app.use(cors({ origin: CLIENT_URL, methods: ["GET", "POST"] }));
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/feed", feedRoutes);
app.use("/reaction", reactionRoutes);
app.use("/comment", commentRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
