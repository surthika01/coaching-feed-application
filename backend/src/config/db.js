"use strict";

require("dotenv").config();

const { Pool } = require("pg");

const db = new Pool({
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "coaching_feed",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on("error", (err) => {
  console.error("❌ [DB] Unexpected pool error:", err.message);
});

async function initDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS feeds (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(255)  NOT NULL,
      content     TEXT          NOT NULL,
      author      VARCHAR(100)  NOT NULL,
      category    VARCHAR(100)  NOT NULL DEFAULT 'General',
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_feeds_created_at ON feeds (created_at DESC);

    CREATE TABLE IF NOT EXISTS reactions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      feed_id     UUID          NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      emoji       VARCHAR(10)   NOT NULL,
      count       INTEGER       NOT NULL DEFAULT 0,
      UNIQUE (feed_id, emoji)
    );
    CREATE INDEX IF NOT EXISTS idx_reactions_feed_id ON reactions (feed_id);

    CREATE TABLE IF NOT EXISTS comments (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      feed_id     UUID          NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      author      VARCHAR(100)  NOT NULL,
      content     TEXT          NOT NULL,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_comments_feed_id ON comments (feed_id);
  `;
  try {
    await db.query(sql);
    console.log("✅ [DB] Tables `feeds`, `reactions`, `comments` are ready");
  } catch (err) {
    console.error("❌ [DB] Failed to initialize tables:", err.message);
    throw err;
  }
}

module.exports = { db, initDatabase };
