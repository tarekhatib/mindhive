const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  renderTrash,
  getTrash,
  restoreNote,
  deleteForever,
} = require("../controllers/trash.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trash
 */

/**
 * @swagger
 * /api/trash:
 *   get:
 *     summary: Get trashed tasks/notes
 *     tags: [Trash]
 */

/**
 * @swagger
 * /api/trash/{id}/restore:
 *   post:
 *     summary: Restore an item
 *     tags: [Trash]
 */

/**
 * @swagger
 * /api/trash/{id}/delete:
 *   delete:
 *     summary: Permanently delete item
 *     tags: [Trash]
 */

router.get("/trash", authenticateToken, renderTrash);
router.get("/api/trash", authenticateToken, getTrash);
router.patch("/api/trash/:id/restore", authenticateToken, restoreNote);
router.delete("/api/trash/:id/delete", authenticateToken, deleteForever);

module.exports = router;
