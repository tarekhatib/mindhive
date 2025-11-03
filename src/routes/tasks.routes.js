const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    res.render("tasks", { tasks: [] });
  } catch (err) {
    console.error("❌ Error loading tasks page:", err);
    res.status(500).send("Error loading tasks page");
  }
});

router.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const [tasks] = await db.query(
      "SELECT id, title, description, due_date, completed FROM tasks WHERE user_id = ? ORDER BY due_date ASC",
      [req.user.id]
    );
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ success: false, message: "Error loading tasks" });
  }
});

router.post("/api/tasks/add", authenticateToken, async (req, res) => {
  try {
    const { user_id, title, description, due_date } = req.body;
    const result = await db.query(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
      [user_id, title, description, due_date]
    );
    res
      .status(201)
      .json({ message: "Task added successfully", taskId: result.insertId });
  } catch (error) {
    console.error("❌ Error adding task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
