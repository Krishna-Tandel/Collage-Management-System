const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/notices
 * Retrieves all posted announcements and campus notices.
 */
router.get('/', verifyToken, (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices: ' + err.message });
  }
});

// POST /api/notices (Admin, Teacher)
router.post('/', verifyToken, requireRole(['Admin', 'Teacher']), (req, res) => {
  const { title, author } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Notice title is required.' });
  }

  const noticeAuthor = author || req.user.name || 'Campus Admin';

  try {
    const stmt = db.prepare('INSERT INTO notices (title, author) VALUES (?, ?)');
    const result = stmt.run(title.trim(), noticeAuthor);

    const newNotice = db.prepare('SELECT * FROM notices WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Notice posted successfully.', notice: newNotice });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notice: ' + err.message });
  }
});

// DELETE /api/notices/:id (Admin only)
router.delete('/:id', verifyToken, requireRole(['Admin']), (req, res) => {
  const { id } = req.params;

  try {
    const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    db.prepare('DELETE FROM notices WHERE id = ?').run(id);
    res.json({ message: 'Notice deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice: ' + err.message });
  }
});

module.exports = router;
