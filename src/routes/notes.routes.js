const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  getAllNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/notes.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/debug/user", authenticateToken, (req, res) => {
  console.log("Authenticated user object:", req.user);
  if (!req.user)
    return res.status(401).json({ message: "User not found in token" });
  res.json({ user: req.user });
});

router.get("/notes", authenticateToken, async (req, res) => {
  try {
    const [notes] = await db.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY course_name, created_at DESC",
      [req.user.id]
    );

    const groupedNotes = notes.reduce((groups, note) => {
      const course = note.course_name || "Uncategorized";
      if (!groups[course]) groups[course] = [];
      groups[course].push(note);
      return groups;
    }, {});

    res.render("notes", { user: req.user, groupedNotes });
  } catch (err) {
    console.error("Error loading notes:", err);
    res.status(500).send("Error loading notes");
  }
});

router.get("/notes/new", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, "Untitled Note", ""]
    );
    const newNoteId = result.insertId;
    res.redirect(`/notes/${newNoteId}`);
  } catch (err) {
    console.error("Error creating new note:", err);
    res.status(500).send("Error creating new note");
  }
});

router.get("/notes/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).send("Note not found");
    }

    const note = rows[0];
    res.render("note-single", { user: req.user, note, page: "notes" });
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).send("Error fetching note");
  }
});

router.get("/api/notes", authenticateToken, getAllNotes);
router.post("/api/notes", authenticateToken, createNote);
router.get("/api/notes/:id", authenticateToken, getNoteById);
router.put("/api/notes/:id", authenticateToken, updateNote);
router.delete("/api/notes/:id", authenticateToken, deleteNote);

router.get("/api/courses", authenticateToken, async (req, res) => {
  try {
    const [courses] = await db.query(
      "SELECT name FROM courses WHERE user_id = ?",
      [req.user.id]
    );
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
});

router.post("/api/courses", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "")
    return res.status(400).json({ message: "Invalid course name" });

  try {
    await db.query("INSERT IGNORE INTO courses (user_id, name) VALUES (?, ?)", [
      req.user.id,
      name.trim(),
    ]);
    res.status(201).json({ message: "Course added successfully" });
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ message: "Error adding course" });
  }
});

module.exports = router;
