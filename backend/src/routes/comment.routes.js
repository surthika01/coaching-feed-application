"use strict";

const { Router } = require("express");
const { addComment, getComments } = require("../controllers/comment.controller");

const router = Router();

router.post("/", addComment);
router.get("/:feed_id", getComments);

module.exports = router;
