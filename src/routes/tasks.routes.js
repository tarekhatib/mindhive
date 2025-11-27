const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");

const {
  renderTasksPage,
  getTasks,
  addTask,
  updateTask,
  deleteTask
} = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/tasks", authenticateToken, renderTasksPage);
router.get("/api/tasks", authenticateToken, getTasks);
router.post("/api/tasks", authenticateToken, addTask);
router.patch("/api/tasks/:id", authenticateToken, updateTask);
router.delete("/api/tasks/:id", authenticateToken, deleteTask);

module.exports = router;