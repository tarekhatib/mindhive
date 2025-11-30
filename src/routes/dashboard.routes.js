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

router.get("/api/search", authenticateToken, async (req, res) => {
  const q = req.query.q?.trim();

  if (!q || q.length < 1) {
    return res.json({ tasks: [], notes: [], users: [] });
  }

  try {
  const [tasks] = await db.query(
      `SELECT id, title, description
       FROM tasks
       WHERE user_id = ? AND title LIKE ?
       LIMIT 5`,
      [req.user.id, `%${q}%`]
    );
    const [notes] = await db.query(
      `SELECT id, title, SUBSTRING(content, 1, 80) AS preview
       FROM notes
       WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
       LIMIT 5`,
      [req.user.id, `%${q}%`, `%${q}%`]
    );
    const [users] = await db.query(
      `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_image,
          COALESCE(SUM(p.points), 0) AS total_points
        FROM users u
        LEFT JOIN pomodoro_sessions p ON p.user_id = u.id
        WHERE (u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)
        GROUP BY u.id
        LIMIT 5`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({ tasks, notes, users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ tasks: [], notes: [], users: [] });
  }
});

module.exports = router;