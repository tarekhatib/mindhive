const db = require("../config/db");

const completePomodoro = async (req, res) => {
  try {
    const { user_id, points } = req.body;
    if (!user_id || !points)
      return res.status(400).json({ message: "Missing required fields" });

    await db.query(
      "INSERT INTO pomodoro_sessions (user_id, points) VALUES (?, ?)",
      [user_id, points]
    );

    res.status(201).json({ message: "Pomodoro session recorded successfully" });
  } catch (error) {
    console.error("SQL Error:", error);
    res.status(500).json({ message: "Error recording pomodoro session" });
  }
};

module.exports = { completePomodoro };
