const db = require("../config/db");

const renderTrash = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM trash WHERE user_id = ? ORDER BY deleted_at DESC",
      [userId]
    );

    res.render("trash", { trash: rows });
  } catch (err) {
    console.error("❌ Error loading trash:", err);
    res.status(500).send("Error loading trash");
  }
};

const getTrash = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT * FROM trash 
       WHERE user_id = ? 
       ORDER BY deleted_at DESC`,
      [userId]
    );

    res.json({ trash: rows });
  } catch (err) {
    console.error("❌ Error fetching trash:", err);
    res.status(500).json({ error: "Failed to load trash" });
  }
};

const restoreNote = async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM trash WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Note not found in trash" });

    const note = rows[0];

    await db.query(
      `INSERT INTO notes (title, content, course_id, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        note.title,
        note.content,
        note.course_id,
        userId,
        note.created_at,
        new Date(),
      ]
    );

    await db.query("DELETE FROM trash WHERE id = ? AND user_id = ?", [
      noteId,
      userId,
    ]);

    res.json({ message: "Note restored successfully" });
  } catch (err) {
    console.error("❌ Error restoring note:", err);
    res.status(500).json({ error: "Failed to restore note" });
  }
};

const deleteForever = async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      "DELETE FROM trash WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found in trash" });

    res.json({ message: "Note deleted permanently" });
  } catch (err) {
    console.error("❌ Error deleting note permanently:", err);
    res.status(500).json({ error: "Failed to delete note permanently" });
  }
};

module.exports = {
  renderTrash,
  getTrash,
  restoreNote,
  deleteForever,
};
