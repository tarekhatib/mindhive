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

module.exports = {
  addTask,
};
