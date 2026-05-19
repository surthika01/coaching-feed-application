"use strict";

const { db } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { invalidateCache } = require("../config/redis");

async function addComment(req, res) {
  const { feed_id, author, content } = req.body;

  if (!feed_id || !author || !content) {
    return res.status(400).json({ error: "feed_id, author, and content are required" });
  }

  if (content.trim().length < 2) {
    return res.status(400).json({ error: "Comment content must be at least 2 characters long" });
  }

  try {
    const id = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO comments (id, feed_id, author, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, feed_id, author, content, created_at`,
      [id, feed_id, author.trim(), content.trim()]
    );

    const comment = rows[0];

    // Emit event
    const io = req.app.get("io");
    if (io) {
      io.emit("new_comment", comment);
    }

    await invalidateCache();

    return res.status(201).json(comment);
  } catch (err) {
    console.error("❌ [POST /comment] Error:", err.message);
    return res.status(500).json({ error: "Failed to add comment" });
  }
}

async function getComments(req, res) {
  const { feed_id } = req.params;

  try {
    const { rows } = await db.query(
      "SELECT id, author, content, created_at FROM comments WHERE feed_id = $1 ORDER BY created_at ASC",
      [feed_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("❌ [GET /comment] Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
}

module.exports = { addComment, getComments };
