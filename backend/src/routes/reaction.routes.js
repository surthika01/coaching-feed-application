"use strict";

const { Router } = require("express");
const { toggleReaction, getReactions } = require("../controllers/reaction.controller");

const router = Router();

router.post("/", toggleReaction);
router.get("/:feed_id", getReactions);

module.exports = router;
