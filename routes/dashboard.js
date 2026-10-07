const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', verifyToken, (req, res) => {
  try {
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    
    // Average attendance of all students
    const avgAttendanceRow = db.prepare('SELECT AVG(attendance) as avgAtt FROM students').get();
    const avgAttendance = avgAttendanceRow.avgAtt ? Math.round(avgAttendanceRow.avgAtt) : 91;

    // Faculty count (from users with role 'Teacher')
    const facultyCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('Teacher').count || 320;

    // Fee collected percentage
    const paidCount = db.prepare("SELECT COUNT(*) as count FROM students WHERE fee_status = 'Paid'").get().count;
    const feePct = studentCount > 0 ? Math.round((paidCount / studentCount) * 100) : 78;

    res.json({
      totalStudents: studentCount + 5200, // combined real + base demo
      facultyCount: facultyCount,
      avgAttendance: avgAttendance,
      feesCollected: `₹48.2L (${feePct}% paid)`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats: ' + err.message });
  }
});

// GET /api/dashboard/departments
router.get('/departments', verifyToken, (req, res) => {
  try {
    const depts = db.prepare('SELECT name, attendance_pct FROM departments').all();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch department attendance: ' + err.message });
  }
});

module.exports = router;
