const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/timetable - Public or Auth endpoint for fetching timetable
router.get('/', (req, res) => {
  const { course } = req.query;
  try {
    let query = 'SELECT * FROM timetable';
    const params = [];
    if (course) {
      query += ' WHERE course = ?';
      params.push(course);
    }
    const slots = db.prepare(query).all(...params);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetable: ' + err.message });
  }
});

module.exports = router;
