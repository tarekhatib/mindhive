const db = require("../config/db");
const bcrypt = require("bcryptjs");
const getRankBySessions = require("../utils/getRank");

const renderSettings = async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, first_name, last_name, username, email, profile_image FROM users WHERE id = ?",
    [req.user.id]
  );

  const [scoreRow] = await db.query(
    `SELECT COALESCE(SUM(points), 0) AS total_points
   FROM pomodoro_sessions
   WHERE user_id = ?`,
    [req.user.id]
  );

  const [rankRow] = await db.query(
    `
   SELECT rank_position FROM (
      SELECT 
          u.id,
          COALESCE(SUM(p.points), 0) AS total_points,
          DENSE_RANK() OVER (ORDER BY COALESCE(SUM(p.points), 0) DESC) AS rank_position
      FROM users u
      LEFT JOIN pomodoro_sessions p ON p.user_id = u.id
      GROUP BY u.id
  ) AS ranked
  WHERE id = ?;
`,
    [req.user.id]
  );

  const [sessionsRow] = await db.query(
    `SELECT COUNT(*) AS total_sessions
   FROM pomodoro_sessions
   WHERE user_id = ?`,
    [req.user.id]
  );

  const rankData = getRankBySessions(sessionsRow[0].total_sessions);

  res.render("settings", {
    user: rows[0],
    totalPoints: scoreRow[0].total_points,
    position: rankRow.length ? rankRow[0].rank_position : "—",
    rankTitle: rankData.title,
    rankEmoji: rankData.emoji,
    totalSessions: sessionsRow[0].total_sessions,
  });
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  changePassword,
  deleteAccount,
  renderSettings,
};
