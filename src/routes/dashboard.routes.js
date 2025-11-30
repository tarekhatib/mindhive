const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");
const { validatePomodoro } = require("../middleware/dashboard.middleware");
const dashboardController = require("../controllers/dashboard.controller");
const leaderboardService = require("../services/leaderboard.service");

const router = express.Router();

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE user_id = ?",
      [userId]
    );

    const leaderboardSmall =
      await leaderboardService.getDashboardLeaderboard(userId);

    res.render("dashboard", {
      user: req.user,
      tasks: tasks || [],
      leaderboardSmall
    });

  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
});

router.post(
  "/api/pomodoro/complete",
  authenticateToken,
  validatePomodoro,
  dashboardController.completePomodoro
);

module.exports = router;