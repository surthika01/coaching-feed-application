"use strict";

const { db } = require("../config/db");
const { invalidateCache } = require("../config/redis");

async function toggleReaction(req, res) {
  const { feed_id, emoji } = req.body;

  if (!feed_id || !emoji) {
    return res.status(400).json({ error: "feed_id and emoji are required" });
  }

  try {
    // Upsert reaction count
    const { rows } = await db.query(
      `INSERT INTO reactions (feed_id, emoji, count) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (feed_id, emoji) 
       DO UPDATE SET count = reactions.count + 1 
       RETURNING feed_id, emoji, count`,
      [feed_id, emoji]
    );

    const reaction = rows[0];

    // Emit event
    const io = req.app.get("io");
    if (io) {
      io.emit("reaction_update", reaction);
    }

    await invalidateCache();

    return res.json(reaction);
  } catch (err) {
    console.error("❌ [POST /reaction] Error:", err.message);
    return res.status(500).json({ error: "Failed to update reaction" });
  }
}

async function getReactions(req, res) {
  const { feed_id } = req.params;

  try {
    const { rows } = await db.query(
      "SELECT emoji, count FROM reactions WHERE feed_id = $1",
      [feed_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("❌ [GET /reaction] Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch reactions" });
  }
}

module.exports = { toggleReaction, getReactions };
