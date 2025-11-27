const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { renderNotes, getNotes, addNote, updateNote, deleteNote, getAllCourses, addCourse} = require("../controllers/notes.controller");

const router = express.Router();

router.get("/notes", authenticateToken, renderNotes);
router.get("/api/notes", authenticateToken, getNotes);
router.post("/api/notes", authenticateToken, addNote);
router.patch("/api/notes/:id", authenticateToken, updateNote);
router.delete("/api/notes/:id", authenticateToken, deleteNote);
router.get("/api/courses", authenticateToken, getAllCourses);
router.post("/api/courses", authenticateToken, addCourse);

module.exports = router;
