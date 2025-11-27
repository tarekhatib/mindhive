const db = require("../config/db");

const renderNotes = async (req, res) => {
  res.render("notes", { user: req.user });
};

const renderNoteEditor = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).render("editor", {
        note: null,
        errorMessage: "Note not found",
      });
    }

    res.render("editor", { note: rows[0], errorMessage: null });

  } catch (err) {
    console.error("❌ Error loading editor:", err);
    res.status(500).render("editor", {
      note: null,
      errorMessage: "Failed to load the note.",
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    );

    res.status(200).json({ notes: rows });
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM notes WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Note not found" });

    res.status(200).json({ note: rows[0] });
  } catch (error) {
    console.error("❌ Error fetching note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, course_id } = req.body;

    if (course_id) {
      const [course] = await db.query(
        "SELECT id FROM courses WHERE id = ? AND user_id = ?",
        [course_id, userId]
      );
      if (course.length === 0) {
        return res.status(403).json({ message: "Invalid course selection" });
      }
    }

    const [result] = await db.query(
      "INSERT INTO notes (user_id, title, content, course_id) VALUES (?, ?, ?, ?)",
      [userId, title, content, course_id || null]
    );

    res.status(201).json({
      message: "Note added successfully",
      noteId: result.insertId,
    });

  } catch (error) {
    console.error("❌ Error adding note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, course_id } = req.body;

    if (course_id) {
      const [course] = await db.query(
        "SELECT id FROM courses WHERE id = ? AND user_id = ?",
        [course_id, userId]
      );
      if (course.length === 0) {
        return res.status(403).json({ message: "Invalid course selection" });
      }
    }

    const [result] = await db.query(
      "UPDATE notes SET title = ?, content = ?, course_id = ? WHERE user_id = ? AND id = ?",
      [title, content, course_id || null, userId, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" });

    res.status(200).json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM notes WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, name FROM courses WHERE user_id = ? ORDER BY name ASC",
      [userId]
    );

    res.status(200).json({ courses: rows });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const [result] = await db.query(
      "INSERT INTO courses (user_id, name) VALUES (?, ?)",
      [userId, name]
    );

    res.status(201).json({
      message: "Course added successfully",
      courseId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error adding course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  renderNotes,
  renderNoteEditor,
  getNotes,
  getNoteById,
  addNote,
  updateNote,
  deleteNote,
  getAllCourses,
  addCourse,
};