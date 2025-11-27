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

module.exports = { completePomodoro };