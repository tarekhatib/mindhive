const express = require("express");
const { completePomodoro } = require("../controllers/pomodoro.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/api/pomodoro/complete", authenticateToken, completePomodoro);

module.exports = router;
