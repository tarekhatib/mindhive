const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

const notesController = require('../controllers/notes.controller');

// Render notes listing page
router.get('/notes', authenticateToken, notesController.renderNotesPage);

// API: get all notes for the authenticated user
router.get('/api/notes', authenticateToken, notesController.getNotes);

// Add a note
router.post('/api/notes/add', authenticateToken, notesController.addNote);

// Render single note page
router.get('/notes/:id', authenticateToken, notesController.renderSingleNote);

// Update a note
router.patch('/api/notes/:id/update', authenticateToken, notesController.updateNote);

// Delete a note
router.delete('/api/notes/:id/delete', authenticateToken, notesController.deleteNote);

module.exports = router;



