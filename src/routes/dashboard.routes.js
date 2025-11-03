const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const db = require("../config/db");
const router = express.Router();

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [
      req.user.id,
    ]);

    res.render("dashboard", {
      user: req.user,
      tasks: tasks || [],
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
});

module.exports = router;
