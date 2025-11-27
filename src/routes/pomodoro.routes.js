const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { validatePomodoro } = require("../middleware/pomodoro.middleware");
const { completePomodoro } = require("../controllers/pomodoro.controller");

const router = express.Router();

router.post(
  "/api/pomodoro/complete",
  authenticateToken,
  validatePomodoro,
  completePomodoro
);

module.exports = router;