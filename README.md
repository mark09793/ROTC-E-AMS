# ROTC Attendance Monitoring System

A web-based system for administrators to upload Excel attendance records and for cadets to view their own attendance. Implements ROTC rules: max 3 absences; 4 = Warning (Running for Drop); 5+ = Dropped; 3 excused = 1 equivalent absence.

## Features

- **Administrator**: Upload Excel file (15 training days), view monitoring table, edit attendance (Present/Absent/Excused), create cadet login accounts.
- **Cadet**: Sign in and view own attendance, totals, and status (Normal / Warning / Dropped).

## Tech Stack

- **Backend**: Node.js, Express, JSON file store (no native DB), JWT auth, Multer (file upload), xlsx (Excel parsing).
- **Frontend**: React 18, React Router, Vite.

## Prerequisites

- Node.js 18+

## Setup and Run

### 1. Backend

```bash
cd backend
npm install
npm start
```

Runs at **http://localhost:3001**. On first run, `backend/data.json` is created and a default admin user is added.

### 2. Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:3000** and proxies `/api` to the backend.

### 3. Default login

- **Admin**: username `admin`, password `admin123`
- **Cadets**: An admin must create cadet accounts from the semester attendance view (“Create login” for a cadet) and share the username/password.

## Excel format

- **Row 1**: Headers. Column A = cadet name (e.g. “Name” or “Cadet”). Columns B–P = Day 1 to Day 15 (or use dates as headers).
- **Rows 2+**: Column A = cadet name; columns B–P = status per day.

**Status values** (case-insensitive): `Present` or `P`, `Absent` or `A`, `Excused` or `E`. Empty = treated as Absent.

To generate a sample template:

```bash
cd backend
node scripts/generateSampleExcel.js
```

This creates `sample_attendance.xlsx` in the backend folder.

## Attendance rules

- Each semester has **15 training days**.
- **Equivalent absences** = (number of Absent) + floor(Excused / 3).
- **Normal**: equivalent absences &lt; 4.
- **Warning (Running for Drop)**: equivalent absences = 4.
- **Dropped**: equivalent absences ≥ 5.

## Project structure

```
backend/
  server.js          # Express app, CORS, routes
  store.js           # JSON file store (data.json)
  db.js              # Loads store, ensures default admin
  auth.js            # JWT sign/verify, middleware
  attendanceLogic.js # Rules and computation
  excelParser.js     # Parse uploaded Excel
  routes/
    auth.js          # POST /api/auth/login
    admin.js         # /api/admin/* (semesters, upload, attendance, create cadet user)
    cadet.js         # /api/cadet/me/attendance
frontend/
  src/
    App.jsx          # Routes, auth state
    api.js           # API helpers
    pages/
      Login.jsx
      CadetDashboard.jsx
      admin/
        AdminLayout.jsx
        AdminSemesters.jsx   # Upload Excel, list semesters
        AdminSemesterView.jsx # Monitoring table, edit, create cadet account
```

## Production

- Build frontend: `cd frontend && npm run build`
- Backend serves `frontend/dist` for non-API routes when present. Set `PORT` and `JWT_SECRET` in the environment.

## Deploy to Render (always online)

This project includes `render.yaml` for one-click-ish deployment as a Render Web Service.

### Steps

1. Create a GitHub repository and push this project (Render deploys from GitHub).
2. In Render, click **New +** → **Blueprint**.
3. Select your GitHub repo and deploy.
4. Render will:
   - Build the frontend into `frontend/dist`
   - Start the backend which serves the frontend and API
   - Store the database file on a persistent disk (so data survives restarts)

### Result

Render will give you a public URL like `https://rotc-e-ams.onrender.com`.
