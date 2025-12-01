const db = require("../config/db");

const completePomodoro = async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;

    const [result] = await db.query(
      "INSERT INTO pomodoro_sessions (user_id, points) VALUES (?, ?)",
      [userId, points]
    );

    res.status(201).json({
      message: "Pomodoro session recorded successfully",
      sessionId: result.insertId,
      points,
    });
  } catch (error) {
    console.error("❌ Error recording pomodoro session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const leaderboardService = require("../services/leaderboard.service");

const renderDashboard = async (req, res) => {
  const leaderboardSmall = await leaderboardService.getDashboardLeaderboard(req.user.id);

  res.render("dashboard", {
    user: req.user,
    leaderboardSmall
  });
};

module.exports = { completePomodoro, renderDashboard };