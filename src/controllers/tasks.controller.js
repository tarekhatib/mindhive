const db = require("../config/db");

const addTask = async (req, res) => {
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
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const filter = (req.query.filter || "all").toLowerCase();

    let query = "SELECT * FROM tasks WHERE user_id = ?";

    if (filter === "today") {
      query += " AND (due_date IS NOT NULL AND DATE(due_date) <= CURDATE())";
    } else if (filter === "upcoming") {
      query += " AND (due_date IS NOT NULL AND DATE(due_date) > CURDATE())";
    }

    query += " ORDER BY due_date ASC";

    const [rows] = await db.promise().query(query, [userId]);
    res.status(200).json({ tasks: rows });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, due_date } = req.body;

    await db
      .promise()
      .query(
        "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ?",
        [title, description, due_date, taskId]
      );

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    await db.promise().query("DELETE FROM tasks WHERE id = ?", [taskId]);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
};
