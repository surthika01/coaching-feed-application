"use strict";

const { Router } = require("express");
const { getFeeds, createFeed } = require("../controllers/feed.controller");

const router = Router();

router.get("/", getFeeds);
router.post("/", createFeed);

module.exports = router;
