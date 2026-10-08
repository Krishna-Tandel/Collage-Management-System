const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const validRoles = ['Admin', 'Teacher', 'Student'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name.trim(), cleanEmail, hashedPassword, role);

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: cleanEmail,
      role: role
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, selectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    // Role override for demo admin if selectedRole is passed, or user's registered role
    const effectiveRole = (cleanEmail === 'admin@college.edu' && selectedRole) ? selectedRole : user.role;

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: effectiveRole
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Sign in successful.',
      token,
      user: payload
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during sign in: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
