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
      "SELECT id, title, description, due_date FROM tasks WHERE user_id = ? ORDER BY due_date ASC",
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

// Update a task
router.patch("/api/tasks/:id/update", authenticateToken, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;
    const { id } = req.params;
    await db.query(
      "UPDATE tasks SET title=?, description=?, due_date=? WHERE id=? AND user_id=?",
      [title, description, due_date, id, req.user.id]
    );
    res.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a task
router.delete("/api/tasks/:id/delete", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM tasks WHERE id=? AND user_id=?", [
      id,
      req.user.id,
    ]);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
