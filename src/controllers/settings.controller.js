const db = require("../config/db");
const bcrypt = require("bcryptjs");

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

  res.render("settings", {
    user: rows[0],
    totalPoints: scoreRow[0].total_points,
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
