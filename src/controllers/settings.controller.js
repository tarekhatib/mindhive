const db = require("../config/db");

const changePassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const userId = req.user.id;

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      new_password,
      userId,
    ]);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
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
