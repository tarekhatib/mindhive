const db = require("../config/db");

exports.getAllNotes = async (req, res) => {
  try {
    const [notes] = await db.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY course_name, created_at DESC",
      [req.user.id]
    );
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading notes" });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, course_name } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    const [result] = await db.query(
      "INSERT INTO notes (user_id, title, content, course_name) VALUES (?, ?, ?, ?)",
      [req.user.id, title, content, course_name || null]
    );

    res
      .status(201)
      .json({ message: "Note added successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding note" });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const [note] = await db.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!note.length)
      return res.status(404).json({ message: "Note not found" });
    res.json(note[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, course_name } = req.body;
    const [result] = await db.query(
      "UPDATE notes SET title = ?, content = ?, course_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [title, content, course_name, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    res.json({ message: "Note updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting note" });
  }
};
