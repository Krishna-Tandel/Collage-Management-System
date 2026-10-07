# 🎓 Campusly – College Management System

A full-stack, modern, high-performance College Management System built with **Node.js**, **Express**, **SQLite3**, and **Vanilla HTML5/CSS3/JavaScript**.

---

## ✨ Features

- 🔐 **Authentication & Authorization**:
  - Secure login & registration system with role-based access (`Admin`, `Teacher`, `Student`).
  - Passwords hashed with `bcryptjs`.
  - Stateless REST API security powered by `JSON Web Tokens (JWT)`.

- 📊 **Real-time Dashboard Analytics**:
  - Live counts for enrolled students, faculty members, and fee collection percentages.
  - Interactive department attendance distribution bar charts.
  - Campus announcements & notice board system.

- 🎓 **Student Management**:
  - Searchable student directory with instant filtering by department/course.
  - Case-insensitive unique roll number verification.
  - Interactive fee payment status toggles & record management.

- 🗓️ **Timetable & Scheduling**:
  - Course-wise clash-free schedules, room allotment, and faculty mappings.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (v5), SQLite (`better-sqlite3`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Frontend**: HTML5, Vanilla CSS3 (Neo-brutalist custom theme), JavaScript (ES6+)
- **Database**: SQLite3 (`campusly.db`) with Write-Ahead Logging (WAL) enabled

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Krishna-Tandel/Collage-Management-System.git
   cd "Collage Management System"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and visit: `http://localhost:3000`

---

## 🔑 Demo Accounts

The application automatically seeds the database with the following demo credentials on first startup:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` |
| **Teacher** | `mehta@college.edu` | `teacher123` |
| **Student** | `aarav@college.edu` | `student123` |

---

## 📡 API Endpoints

### 🗝️ Authentication
- `POST /api/auth/register` - Register a new user (`Admin`, `Teacher`, `Student`)
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Get current user profile (Requires JWT)

### 🎓 Students
- `GET /api/students` - List students (Supports `?search=` and `?dept=`)
- `POST /api/students` - Create student record (`Admin`, `Teacher`)
- `PUT /api/students/:id` - Update student details or fee status (`Admin`, `Teacher`)
- `DELETE /api/students/:id` - Delete student record (`Admin` only)

### 📣 Notices
- `GET /api/notices` - Fetch campus announcements
- `POST /api/notices` - Post a new notice (`Admin`, `Teacher`)
- `DELETE /api/notices/:id` - Delete a notice (`Admin` only)

### 📊 Dashboard & Timetable
- `GET /api/dashboard/stats` - Summary stats (student count, attendance avg, fee collection)
- `GET /api/dashboard/departments` - Department-wise attendance percentages
- `GET /api/timetable` - View active class schedules

---

## 📝 License

Distributed under the ISC License.
