const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  renderTasks,
  getTasks,
  addTask,
  updateTask,
  toggleComplete,
  deleteTask,
} = require("../controllers/tasks.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for logged-in user
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming]
 *     responses:
 *       200:
 *         description: List of tasks
 */

/**
 * @swagger
 * /api/tasks/add:
 *   post:
 *     summary: Add a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 */

/**
 * @swagger
 * /api/tasks/{id}/update:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               due_date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Task updated
 */

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Complete a task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Task deleted
 */
/**
 * @swagger
 * /api/tasks/{id}/delete:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Task deleted
 */

router.get("/tasks", authenticateToken, renderTasks);
router.get("/api/tasks", authenticateToken, getTasks);
router.post("/api/tasks/add", authenticateToken, addTask);
router.patch("/api/tasks/:id/update", authenticateToken, updateTask);
router.patch("/api/tasks/:id/complete", authenticateToken, toggleComplete);
router.delete("/api/tasks/:id/delete", authenticateToken, deleteTask);

module.exports = router;
