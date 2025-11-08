const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  attachUserId,
  validatePomodoro,
} = require("../middleware/pomodoro.middleware");
const { completePomodoro } = require("../controllers/pomodoro.controller");

const router = express.Router();

router.post(
  "/api/pomodoro/complete",
  authenticateToken,
  attachUserId,
  validatePomodoro,
  completePomodoro
);

module.exports = router;
