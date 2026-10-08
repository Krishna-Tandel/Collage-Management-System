const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'campusly.db');
const db = new Database(dbPath);

// Enable foreign keys & WAL mode for performance
db.pragma('journal_mode = WAL');

/**
 * Initializes the SQLite database tables and seeds initial demo records.
 * Tables: users, students, notices, departments, timetable
 */
function initDb() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Teacher', 'Student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Students Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      attendance INTEGER NOT NULL DEFAULT 100,
      fee_status TEXT NOT NULL CHECK(fee_status IN ('Paid', 'Due')),
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Notices Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Departments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      attendance_pct INTEGER NOT NULL
    );
  `);

  // 5. Timetable Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      subject TEXT NOT NULL,
      room TEXT NOT NULL,
      faculty TEXT NOT NULL,
      color TEXT DEFAULT '#7c3aed'
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Seed admin user if not existing
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const hashedPass = bcrypt.hashSync('admin123', 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    insertUser.run('Admin', 'admin@college.edu', hashedPass, 'Admin');
    
    // Seed default teacher and student demo users
    const teacherPass = bcrypt.hashSync('teacher123', 10);
    const studentPass = bcrypt.hashSync('student123', 10);
    insertUser.run('Prof. Mehta', 'mehta@college.edu', teacherPass, 'Teacher');
    insertUser.run('Aarav Sharma', 'aarav@college.edu', studentPass, 'Student');
  }

  // Seed default students if not existing
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  if (studentCount === 0) {
    const insertStudent = db.prepare(
      'INSERT INTO students (roll_no, name, course, attendance, fee_status, email) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const sampleStudents = [
      ['BCA101', 'Aarav Sharma', 'BCA', 94, 'Paid', 'aarav@college.edu'],
      ['BCA114', 'Isha Verma', 'BCA', 88, 'Paid', 'isha@college.edu'],
      ['BCM207', 'Rohan Gupta', 'B.Com', 72, 'Due', 'rohan@college.edu'],
      ['BSC312', 'Meera Nair', 'B.Sc', 96, 'Paid', 'meera@college.edu'],
      ['BA118', 'Kabir Singh', 'BA', 81, 'Due', 'kabir@college.edu'],
      ['BCA133', 'Sneha Patil', 'BCA', 91, 'Paid', 'sneha@college.edu'],
      ['BCM221', 'Farhan Ali', 'B.Com', 67, 'Due', 'farhan@college.edu'],
      ['BSC340', 'Diya Joshi', 'B.Sc', 89, 'Paid', 'diya@college.edu']
    ];
    sampleStudents.forEach(s => insertStudent.run(...s));
  }

  // Seed default departments if not existing
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
  if (deptCount === 0) {
    const insertDept = db.prepare('INSERT INTO departments (name, attendance_pct) VALUES (?, ?)');
    const sampleDepts = [
      ['BCA', 93],
      ['B.Com', 84],
      ['B.Sc', 90],
      ['BA', 78],
      ['BBA', 88]
    ];
    sampleDepts.forEach(d => insertDept.run(...d));
  }

  // Seed default notices if not existing
  const noticeCount = db.prepare('SELECT COUNT(*) as count FROM notices').get().count;
  if (noticeCount === 0) {
    const insertNotice = db.prepare('INSERT INTO notices (title, author) VALUES (?, ?)');
    const sampleNotices = [
      ['Mid-term exams start 20 Oct', 'Exam cell'],
      ['Library closed on Friday', 'Library'],
      ['Annual fest registrations open', 'Student council'],
      ['Fee deadline extended to 25 Oct', 'Accounts']
    ];
    sampleNotices.forEach(n => insertNotice.run(...n));
  }

  // Seed default timetable if not existing
  const ttCount = db.prepare('SELECT COUNT(*) as count FROM timetable').get().count;
  if (ttCount === 0) {
    const insertTt = db.prepare(
      'INSERT INTO timetable (course, time_slot, subject, room, faculty, color) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const sampleTt = [
      ['BCA Semester 4', '9:00', 'Data Structures', 'Room 204', 'Prof. Mehta', '#7c3aed'],
      ['BCA Semester 4', '10:00', 'Database Systems', 'Lab 2', 'Dr. Rao', '#0ea5a0'],
      ['BCA Semester 4', '11:30', 'Web Technologies', 'Room 110', 'Ms. Khan', '#ff3d8b'],
      ['BCA Semester 4', '1:30', 'Discrete Maths', 'Room 204', 'Prof. Iyer', '#ff8a3d']
    ];
    sampleTt.forEach(t => insertTt.run(...t));
  }
}

initDb();

module.exports = db;
