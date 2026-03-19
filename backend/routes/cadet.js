const express = require('express');
const store = require('../store');
const { authMiddleware } = require('../auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/me/attendance', (req, res) => {
  const cadetId = req.user.cadet_id;
  if (!cadetId) return res.status(403).json({ error: 'No cadet record linked to this account' });

  const cadet = store.getCadetById(cadetId);
  if (!cadet) return res.status(404).json({ error: 'Cadet record not found' });

  const days = store.getTrainingDaysBySemesterId(cadet.semester_id);
  const att = store.getAttendanceByCadetId(cadetId);
  const byDay = {};
  att.forEach((a) => { byDay[a.training_day_id] = a.status; });

  // If no record exists for a day, treat it as upcoming (null) instead of Absent
  const records = days.map((d) => ({ date: d.date, day_number: d.day_number, status: byDay[d.id] || null }));

  res.json({
    cadet: {
      id: cadet.id,
      name: cadet.name,
      total_absences: cadet.total_absences,
      excused_count: cadet.excused_count,
      equivalent_absences: cadet.equivalent_absences,
      status: cadet.status,
    },
    semester: store.getSemesterById(cadet.semester_id),
    records,
  });
});

module.exports = router;
