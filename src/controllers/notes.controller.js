const db = require('../config/db');

const renderNotesPage = async (req, res) => {
  try {
    const [notes] = await db.query(
      "SELECT id, title, content AS body, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.render('notes', { notes });
  } catch (err) {
    console.error('❌ Error loading notes page:', err && err.stack ? err.stack : err);
    res.render('notes', { notes: [], errorMessage: 'Could not load notes (database unavailable)' });
  }
};

const getNotes = async (req, res) => {
  try {
    const [notes] = await db.query(
      "SELECT id, title, content AS body, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ success: true, notes });
  } catch (err) {
    console.error('❌ Error fetching notes:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: 'Error loading notes' });
  }
};

const addNote = async (req, res) => {
  try {
    const { user_id, title, body } = req.body;
    const [result] = await db.query(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, body]
    );
    res.status(201).json({ message: 'Note added successfully', noteId: result.insertId });
  } catch (err) {
    console.error('❌ Error adding note:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const renderSingleNote = async (req, res) => {
  try {
    const { id } = req.params;
    const [notes] = await db.query(
      'SELECT id, title, content AS body, created_at FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!notes || notes.length === 0) return res.status(404).render('single_note', { note: null, errorMessage: 'Note not found' });
    res.render('single_note', { note: notes[0] });
  } catch (err) {
    console.error('❌ Error loading single note page:', err && err.stack ? err.stack : err);
    res.status(500).render('single_note', { note: null, errorMessage: 'Error loading note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, body } = req.body;
    const { id } = req.params;
    await db.query('UPDATE notes SET title=?, content=? WHERE id=? AND user_id=?', [title, body, id, req.user.id]);
    res.json({ success: true, message: 'Note updated successfully' });
  } catch (err) {
    console.error('❌ Error updating note:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM notes WHERE id=? AND user_id=?', [id, req.user.id]);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting note:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  renderNotesPage,
  getNotes,
  addNote,
  renderSingleNote,
  updateNote,
  deleteNote,
};
