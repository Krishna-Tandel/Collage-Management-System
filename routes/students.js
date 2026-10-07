const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/students - Get all students (with search and department filters)
router.get('/', verifyToken, (req, res) => {
  const { search, dept } = req.query;

  try {
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (dept) {
      query += ' AND course = ?';
      params.push(dept);
    }

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(roll_no) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY id DESC';

    const students = db.prepare(query).all(...params);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

// POST /api/students - Add new student (Admin, Teacher)
router.post('/', verifyToken, requireRole(['Admin', 'Teacher']), (req, res) => {
  const { roll_no, name, course, attendance, fee_status, email } = req.body;

  if (!roll_no || !name || !course) {
    return res.status(400).json({ error: 'Roll number, name, and course are required.' });
  }

  const cleanRoll = roll_no.trim().toUpperCase();

  try {
    const existing = db.prepare('SELECT id FROM students WHERE UPPER(roll_no) = ?').get(cleanRoll);
    if (existing) {
      return res.status(400).json({ error: 'A student with this roll number already exists.' });
    }

    const stmt = db.prepare(
      'INSERT INTO students (roll_no, name, course, attendance, fee_status, email) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      cleanRoll,
      name.trim(),
      course.trim(),
      attendance !== undefined ? parseInt(attendance, 10) : 100,
      fee_status || 'Paid',
      email ? email.trim() : null
    );

    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Student added successfully.', student: newStudent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student: ' + err.message });
  }
});

// PUT /api/students/:id - Update student record (Admin, Teacher)
router.put('/:id', verifyToken, requireRole(['Admin', 'Teacher']), (req, res) => {
  const { id } = req.params;
  const { roll_no, name, course, attendance, fee_status, email } = req.body;

  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    let updatedRoll = student.roll_no;
    if (roll_no) {
      updatedRoll = roll_no.trim().toUpperCase();
      const duplicate = db.prepare('SELECT id FROM students WHERE UPPER(roll_no) = ? AND id != ?').get(updatedRoll, id);
      if (duplicate) {
        return res.status(400).json({ error: 'Another student with this roll number already exists.' });
      }
    }

    const updatedName = name ? name.trim() : student.name;
    const updatedCourse = course ? course.trim() : student.course;
    const updatedAttendance = attendance !== undefined ? parseInt(attendance, 10) : student.attendance;
    const updatedFeeStatus = fee_status || student.fee_status;
    const updatedEmail = email !== undefined ? (email ? email.trim() : null) : student.email;

    db.prepare(`
      UPDATE students 
      SET roll_no = ?, name = ?, course = ?, attendance = ?, fee_status = ?, email = ?
      WHERE id = ?
    `).run(updatedRoll, updatedName, updatedCourse, updatedAttendance, updatedFeeStatus, updatedEmail, id);

    const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json({ message: 'Student record updated successfully.', student: updatedStudent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student: ' + err.message });
  }
});

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', verifyToken, requireRole(['Admin']), (req, res) => {
  const { id } = req.params;

  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    res.json({ message: 'Student record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student: ' + err.message });
  }
});

module.exports = router;
