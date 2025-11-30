const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  renderNotes,
  renderNoteEditor,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getAllCourses,
  addCourse,
  deleteCourse,
} = require("../controllers/notes.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200: { description: Notes list }
 */

/**
 * @swagger
 * /api/notes/create:
 *   post:
 *     summary: Create note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *     responses:
 *       201: { description: Note created }
 */

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags: [Notes]
 */

/**
 * @swagger
 * /api/notes/{id}/update:
 *   patch:
 *     summary: Update a note
 *     tags: [Notes]
 */

/**
 * @swagger
 * /api/notes/{id}/delete:
 *   delete:
 *     summary: Delete note
 *     tags: [Notes]
 */

router.get("/notes", authenticateToken, renderNotes);
router.get("/notes/edit/:id", authenticateToken, renderNoteEditor);
router.get("/api/notes", authenticateToken, getNotes);
router.post("/api/notes", authenticateToken, addNote);
router.patch("/api/notes/:id", authenticateToken, updateNote);
router.delete("/api/notes/:id", authenticateToken, deleteNote);
router.get("/api/courses", authenticateToken, getAllCourses);
router.post("/api/courses", authenticateToken, addCourse);
router.delete("/api/courses/:id", authenticateToken, deleteCourse);

module.exports = router;
