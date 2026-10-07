const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const noticeRoutes = require('./routes/notices');
const dashboardRoutes = require('./routes/dashboard');
const timetableRoutes = require('./routes/timetable');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Campusly CMS Backend',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timetable', timetableRoutes);

// Serve static frontend files (index.html, login.html, dashboard.html, style.css, etc.)
app.use(express.static(path.join(__dirname)));

// Catch-all route to serve index.html for non-API static routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` 🚀 Campusly Backend Server running on http://localhost:${PORT}`);
  console.log(`===================================================`);
});
