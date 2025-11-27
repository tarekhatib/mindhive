const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  renderTasks,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/tasks", authenticateToken, renderTasks);
router.get("/api/tasks", authenticateToken, getTasks);
router.post("/api/tasks/add", authenticateToken, addTask);
router.patch("/api/tasks/:id/update", authenticateToken, updateTask);
router.delete("/api/tasks/:id/delete", authenticateToken, deleteTask);

module.exports = router;