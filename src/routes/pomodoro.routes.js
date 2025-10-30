const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/api/pomodoro/complete", authenticateToken, async (req, res) => {
  try {
    const { user_id, points } = req.body;
    console.log("✅ Received request:", { user_id, points });

    if (!user_id || !points) {
      console.warn("⚠️ Missing user_id or points");
      return res.status(400).json({ message: "Missing user_id or points" });
    }

    await db.query(
      "INSERT INTO pomodoro_sessions (user_id, points) VALUES (?, ?)",
      [user_id, points]
    );

    console.log("✅ Pomodoro session inserted for user:", user_id);
    res.status(201).json({ message: "Pomodoro session recorded successfully" });
  } catch (err) {
    console.error("Pomodoro insert error:", err);
    res.status(500).json({
      message: "Error recording pomodoro session",
      error: err.message,
    });
  }
});

module.exports = router;
