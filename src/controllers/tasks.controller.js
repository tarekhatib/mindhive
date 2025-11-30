const db = require("../config/db");

const renderTasks = async (req, res) => {
  try {
    res.render("tasks", { tasks: [] });
  } catch (err) {
    console.error("❌ Error loading tasks page:", err);
    res.status(500).send("Error loading tasks page");
  }
};

const getTasks = async (req, res) => {
  const userId = req.user.id;
  const filter = req.query.filter || "all";

  let query = "SELECT * FROM tasks WHERE user_id = ?";
  let params = [userId];

  if (filter === "today") {
    query += " AND due_date IS NOT NULL AND DATE(CONVERT_TZ(due_date, '+00:00', '+02:00')) = CURDATE()";
  } else if (filter === "upcoming") {
    query += " AND due_date IS NOT NULL AND DATE(CONVERT_TZ(due_date, '+00:00', '+02:00')) > CURDATE()";
  } else if (filter === "past due") {
    query += " AND due_date IS NOT NULL AND DATE(CONVERT_TZ(due_date, '+00:00', '+02:00')) < CURDATE()";
  }

  query += " ORDER BY due_date IS NULL, due_date ASC";

  try {
    const [rows] = await db.execute(query, params);
    res.json({ tasks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const addTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, due_date } = req.body;

    const [result] = await db.query(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
      [userId, title, description, due_date]
    );

    res.status(201).json({
      message: "Task added successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error adding task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { title, description, due_date } = req.body;

    const [result] = await db.query(
      "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?",
      [title, description, due_date, taskId, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  renderTasks,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
};
