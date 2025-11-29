const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  renderTrash,
  getTrash,
  restoreNote,
  deleteForever,
} = require("../controllers/trash.controller");

const router = express.Router();

router.get("/trash", authenticateToken, renderTrash);
router.get("/api/trash", authenticateToken, getTrash);
router.patch("/api/trash/:id/restore", authenticateToken, restoreNote);
router.delete("/api/trash/:id/delete", authenticateToken, deleteForever);

module.exports = router;