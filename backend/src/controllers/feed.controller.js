"use strict";

const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/db");
const { getCache, setCache, invalidateCache } = require("../config/redis");

// GET /feed
async function getFeeds(_req, res) {
  try {
    // 1. Try Redis cache first
    const cached = await getCache();
    if (cached) {
      console.log("⚡ [Cache] HIT — serving feeds from Redis");
      return res.json({ source: "cache", feeds: cached });
    }

    // 2. Cache miss — query PostgreSQL
    console.log("🗄️  [Cache] MISS — querying PostgreSQL");
    const { rows } = await db.query(`
      SELECT 
        f.id, f.title, f.content, f.author, f.category, f.created_at,
        COALESCE(
          (SELECT json_object_agg(r.emoji, r.count) 
           FROM reactions r 
           WHERE r.feed_id = f.id),
          '{}'::json
        ) as reactions,
        (SELECT count(*)::int FROM comments c WHERE c.feed_id = f.id) as comment_count
      FROM feeds f
      ORDER BY f.created_at DESC
    `);

    // 3. Store in cache
    await setCache(rows);

    return res.json({ source: "database", feeds: rows });
  } catch (err) {
    console.error("❌ [GET /feed] Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch feeds", details: err.message });
  }
}

// POST /feed
async function createFeed(req, res) {
  const { title, content, author, category } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({
      error: "Validation failed",
      required: ["title", "content", "author"],
    });
  }

  if (title.trim().length < 3 || content.trim().length < 5) {
    return res.status(400).json({
      error: "title must be ≥ 3 chars and content must be ≥ 5 chars",
    });
  }

  try {
    const feedId = uuidv4();
    const safeCategory = (category || "General").trim();

    const { rows } = await db.query(
      `INSERT INTO feeds (id, title, content, author, category, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, title, content, author, category, created_at`,
      [feedId, title.trim(), content.trim(), author.trim(), safeCategory]
    );

    const newFeed = {
      ...rows[0],
      reactions: {},
      comment_count: 0
    };
    console.log(`✅ [DB] Feed created: ${newFeed.id}`);

    // Invalidate Redis cache
    await invalidateCache();

    // Broadcast via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new_feed", { feed: newFeed, eventId: uuidv4() });
      console.log(`📡 [Socket] Broadcasted new_feed: ${newFeed.id}`);
    }

    return res.status(201).json({ message: "Feed created successfully", feed: newFeed });
  } catch (err) {
    console.error("❌ [POST /feed] Error:", err.message);
    return res.status(500).json({ error: "Failed to create feed", details: err.message });
  }
}

module.exports = { getFeeds, createFeed };
