const db = require("../config/db");

const changePassword = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT password_hash FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .promise()
      .query("UPDATE users SET password_hash = ? WHERE id = ?", [
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
  deleteAccount,
  changePassword,
};
