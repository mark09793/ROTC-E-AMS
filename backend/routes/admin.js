const express = require('express');
const multer = require('multer');
const store = require('../store');
const { authMiddleware, requireAdmin } = require('../auth');
const { parseExcelBuffer } = require('../excelParser');
const { computeCadetTotals } = require('../attendanceLogic');

const router = express.Router();
router.use(authMiddleware);
router.use(requireAdmin);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

router.get('/semesters', (req, res) => {
  const all = store.getSemesters();
  if (req.user.role === 'admin') return res.json(all);
  if (req.user.role === 'campus') {
    return res.json(all.filter((s) => s.campus === req.user.campus && s.sex === req.user.sex));
  }
  return res.status(403).json({ error: 'Not allowed' });
});

router.get('/users', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  res.json(store.getUsers().map(sanitizeUser));
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const semesterName = req.body.semesterName || `Semester ${new Date().toISOString().slice(0, 10)}`;
  let campus = req.body.campus || null;
  let sex = req.body.sex || null;
  let parsed;
  try {
    parsed = parseExcelBuffer(req.file.buffer);
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Invalid Excel file' });
  }
  if (!parsed.cadets || parsed.cadets.length === 0) {
    return res.status(400).json({ error: 'No cadet names found. Ensure row 1 is headers (Names, Training Day 1...) and row 2+ have names in column A.' });
  }

  const semester = store.createSemester(semesterName, campus, sex);
  const semesterId = semester.id;

  for (let i = 0; i < parsed.dayCount; i++) {
    const dateLabel = parsed.dates[i] || `Day ${i + 1}`;
    store.createTrainingDay(semesterId, dateLabel, i + 1);
  }
  const trainingDays = store.getTrainingDaysBySemesterId(semesterId);

  for (const cadet of parsed.cadets) {
    const c = store.createCadet({
      semester_id: semesterId,
      name: cadet.name,
      total_absences: cadet.total_absences,
      excused_count: cadet.excused_count,
      equivalent_absences: cadet.equivalent_absences,
      status: cadet.status,
    });
    cadet.records.forEach((rec, idx) => {
      const td = trainingDays[idx];
      // Only persist days that already happened (status not null)
      if (td && rec.status) store.setAttendance(c.id, td.id, rec.status);
    });
  }

  res.json({ semesterId, message: 'Upload successful', cadetCount: parsed.cadets.length });
});

router.get('/semesters/:id/attendance', (req, res) => {
  const semesterId = parseInt(req.params.id, 10);
  const semester = store.getSemesterById(semesterId);
  if (!semester) return res.status(404).json({ error: 'Semester not found' });

  // Campus accounts can only view their own campus
  if (req.user.role === 'campus' && (semester.campus !== req.user.campus || semester.sex !== req.user.sex)) {
    return res.status(403).json({ error: 'Not allowed for this campus' });
  }

  const days = store.getTrainingDaysBySemesterId(semesterId);
  const cadets = store.getCadetsBySemesterId(semesterId);
  const allAttendance = store.getAttendanceBySemesterId(semesterId);

  const attendanceByCadet = {};
  allAttendance.forEach((row) => {
    if (!attendanceByCadet[row.cadet_id]) attendanceByCadet[row.cadet_id] = {};
    const day = days.find((d) => d.id === row.training_day_id);
    if (day) attendanceByCadet[row.cadet_id][day.day_number] = row.status;
  });

  const rows = cadets.map((c) => {
    const byDay = {};
    // If no record exists for a day, treat it as upcoming (null) instead of Absent
    days.forEach((d) => { byDay[d.day_number] = attendanceByCadet[c.id]?.[d.day_number] || null; });
    return {
      id: c.id,
      name: c.name,
      total_absences: c.total_absences,
      excused_count: c.excused_count,
      equivalent_absences: c.equivalent_absences,
      status: c.status,
      byDay,
      dates: days.map((d) => ({ day_number: d.day_number, date: d.date })),
    };
  });

  res.json({ semester, days, cadets: rows });
});

router.delete('/semesters/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const semesterId = parseInt(req.params.id, 10);
  const semester = store.getSemesterById(semesterId);
  if (!semester) return res.status(404).json({ error: 'Semester not found' });

  store.deleteSemester(semesterId);
  res.json({ ok: true, message: 'Semester deleted' });
});

router.patch('/users/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const id = parseInt(req.params.id, 10);
  const existing = store.findUserById(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  if (existing.role === 'admin' && id === req.user.id) {
    // allow editing own admin account
  }

  const { username, password, campus, sex } = req.body;
  if (username && username !== existing.username) {
    const usernameTaken = store.findUserByUsername(username);
    if (usernameTaken && usernameTaken.id !== id) {
      return res.status(400).json({ error: 'Username already taken' });
    }
  }

  const updates = {};
  if (typeof username === 'string' && username.trim()) updates.username = username.trim();
  if (typeof campus === 'string') updates.campus = campus || null;
  if (typeof sex === 'string') updates.sex = sex || null;
  if (typeof password === 'string' && password.trim()) {
    const hash = require('bcryptjs').hashSync(password, 10);
    updates.password_hash = hash;
  }

  const updated = store.updateUser(id, updates);
  res.json({ ok: true, user: sanitizeUser(updated) });
});

router.delete('/users/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const id = parseInt(req.params.id, 10);
  const existing = store.findUserById(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  if (existing.role === 'admin') return res.status(400).json({ error: 'Main admin account cannot be deleted' });
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account while logged in' });
  store.deleteUser(id);
  res.json({ ok: true, message: 'Account deleted' });
});

router.patch('/attendance/:cadetId/:trainingDayId', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const cadetId = parseInt(req.params.cadetId, 10);
  const trainingDayId = parseInt(req.params.trainingDayId, 10);
  const { status } = req.body;
  if (!['Present', 'Absent', 'Excused'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existing = store.getAttendanceByCadetId(cadetId).find((a) => a.training_day_id === trainingDayId);
  if (!existing) return res.status(404).json({ error: 'Attendance record not found' });

  store.setAttendance(cadetId, trainingDayId, status);

  const records = store.getAttendanceByCadetId(cadetId);
  const totals = computeCadetTotals(records);
  store.updateCadet(cadetId, {
    total_absences: totals.total_absences,
    excused_count: totals.excused_count,
    equivalent_absences: totals.equivalent_absences,
    status: totals.status,
  });

  res.json({ ok: true, cadet: totals });
});

router.get('/cadets/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const id = parseInt(req.params.id, 10);
  const cadet = store.getCadetById(id);
  if (!cadet) return res.status(404).json({ error: 'Cadet not found' });
  const days = store.getTrainingDaysBySemesterId(cadet.semester_id);
  const att = store.getAttendanceByCadetId(id);
  const byDay = {};
  att.forEach((a) => { byDay[a.training_day_id] = a.status; });
  res.json({ cadet, days: days.map((d) => ({ ...d, status: byDay[d.id] || 'Absent' })) });
});

module.exports = router;
