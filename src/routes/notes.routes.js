const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { renderNotes, renderNoteEditor, getNotes, addNote, updateNote, deleteNote, getAllCourses, addCourse, deleteCourse} = require("../controllers/notes.controller");

const router = express.Router();

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
