const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = (() => {
  const fromEnv = process.env.DATA_FILE && String(process.env.DATA_FILE).trim();
  if (fromEnv) return fromEnv;
  return path.join(__dirname, 'data.json');
})();
const LEGACY_LOGIN_USERNAMES = new Set(['admin', 'echague', 'angadanan', 'jones', 'santiago']);
const DEFAULT_ACCOUNTS = [
  { username: 'ROTCU-2026', password: 'ROTCU-ADMIN123', role: 'admin', campus: null, sex: null },
  { username: 'ROTC-ECHAGUE-2026-MALE', password: 'ROTCE-Cadets123', role: 'campus', campus: 'ECHAGUE', sex: 'MALE' },
  { username: 'ROTC-ECHAGUE-2026-FEMALE', password: 'ROTCE-Cadettes123', role: 'campus', campus: 'ECHAGUE', sex: 'FEMALE' },
  { username: 'ROTC-ANGADANAN-2026-MALE', password: 'ROTCA-Cadets123', role: 'campus', campus: 'ANGADANAN', sex: 'MALE' },
  { username: 'ROTC-ANGADANAN-2026-FEMALE', password: 'ROTCA-Cadettes123', role: 'campus', campus: 'ANGADANAN', sex: 'FEMALE' },
  { username: 'ROTC-JONES-2026-MALE', password: 'ROTCJ-Cadets123', role: 'campus', campus: 'JONES', sex: 'MALE' },
  { username: 'ROTC-JONES-2026-FEMALE', password: 'ROTCJ-Cadettes123', role: 'campus', campus: 'JONES', sex: 'FEMALE' },
  { username: 'ROTC-SANTIAGO-2026-MALE', password: 'ROTCS-Cadets123', role: 'campus', campus: 'SANTIAGO EXTENSION', sex: 'MALE' },
  { username: 'ROTC-SANTIAGO-2026-FEMALE', password: 'ROTCS-Cadets123', role: 'campus', campus: 'SANTIAGO EXTENSION', sex: 'FEMALE' },
];

let state = null;

function ensureDefaultAccounts(data) {
  data.users = data.users.filter((u) => u.cadet_id || !LEGACY_LOGIN_USERNAMES.has(String(u.username).toLowerCase()));
  for (const account of DEFAULT_ACCOUNTS) {
    const existing = data.users.find((u) => String(u.username).toLowerCase() === account.username.toLowerCase());
    if (existing) {
      existing.password_hash = bcrypt.hashSync(account.password, 10);
      existing.role = account.role;
      existing.cadet_id = null;
      existing.campus = account.campus;
      existing.sex = account.sex;
      continue;
    }
    data.users.push({
      id: data.nextId.users++,
      username: account.username,
      password_hash: bcrypt.hashSync(account.password, 10),
      role: account.role,
      cadet_id: null,
      campus: account.campus,
      sex: account.sex,
      created_at: new Date().toISOString(),
    });
  }
}

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

function save(data) {
  state = data;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  } catch {
    // ignore
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function init() {
  let data = load();
  if (!data) {
    data = {
      nextId: { users: 1, semesters: 1, cadets: 1, training_days: 1, attendance: 1 },
      users: [],
      semesters: [],
      cadets: [],
      training_days: [],
      attendance: [],
    };
  }
  data.nextId = data.nextId || { users: 1, semesters: 1, cadets: 1, training_days: 1, attendance: 1 };
  data.users = Array.isArray(data.users) ? data.users : [];
  data.semesters = Array.isArray(data.semesters) ? data.semesters : [];
  data.cadets = Array.isArray(data.cadets) ? data.cadets : [];
  data.training_days = Array.isArray(data.training_days) ? data.training_days : [];
  data.attendance = Array.isArray(data.attendance) ? data.attendance : [];

  ensureDefaultAccounts(data);
  const maxUserId = data.users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
  data.nextId.users = Math.max(data.nextId.users || 1, maxUserId + 1);
  save(data);
  return data;
}

state = init();

function getState() {
  return state;
}

function nextId(key) {
  const s = getState();
  const id = s.nextId[key]++;
  save(s);
  return id;
}

// Users
function findUserByUsername(username) {
  return getState().users.find((u) => u.username === username) || null;
}
function findUserById(id) {
  return getState().users.find((u) => u.id === id) || null;
}
function createUser(record) {
  const s = getState();
  const id = nextId('users');
  const row = { id, ...record, created_at: new Date().toISOString() };
  s.users.push(row);
  save(s);
  return row;
}
function getUsers() {
  return [...getState().users].sort((a, b) => {
    if (a.role !== b.role) return String(a.role).localeCompare(String(b.role));
    if ((a.campus || '') !== (b.campus || '')) return String(a.campus || '').localeCompare(String(b.campus || ''));
    if ((a.sex || '') !== (b.sex || '')) return String(a.sex || '').localeCompare(String(b.sex || ''));
    return String(a.username).localeCompare(String(b.username));
  });
}
function updateUser(id, updates) {
  const s = getState();
  const i = s.users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  Object.assign(s.users[i], updates);
  save(s);
  return s.users[i];
}
function deleteUser(id) {
  const s = getState();
  const i = s.users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  const [removed] = s.users.splice(i, 1);
  save(s);
  return removed;
}

// Semesters
function getSemesters() {
  return [...getState().semesters].sort((a, b) => b.id - a.id);
}
function getSemesterById(id) {
  return getState().semesters.find((s) => s.id === id) || null;
}
function createSemester(name, campus, sex) {
  const s = getState();
  const id = nextId('semesters');
  const row = { id, name, campus: campus || null, sex: sex || null, created_at: new Date().toISOString() };
  s.semesters.push(row);
  save(s);
  return row;
}
function deleteSemester(semesterId) {
  const s = getState();
  const semester = s.semesters.find((sem) => sem.id === semesterId);
  if (!semester) return null;

  const cadetIds = s.cadets.filter((c) => c.semester_id === semesterId).map((c) => c.id);
  const cadetIdSet = new Set(cadetIds);
  const dayIds = s.training_days.filter((d) => d.semester_id === semesterId).map((d) => d.id);
  const dayIdSet = new Set(dayIds);

  s.semesters = s.semesters.filter((sem) => sem.id !== semesterId);
  s.cadets = s.cadets.filter((c) => c.semester_id !== semesterId);
  s.training_days = s.training_days.filter((d) => d.semester_id !== semesterId);
  s.attendance = s.attendance.filter((a) => !cadetIdSet.has(a.cadet_id) && !dayIdSet.has(a.training_day_id));
  s.users = s.users.filter((u) => !cadetIdSet.has(u.cadet_id));

  save(s);
  return semester;
}

// Training days
function getTrainingDaysBySemesterId(semesterId) {
  return getState().training_days.filter((d) => d.semester_id === semesterId).sort((a, b) => a.day_number - b.day_number);
}
function createTrainingDay(semesterId, date, dayNumber) {
  const s = getState();
  const id = nextId('training_days');
  const row = { id, semester_id: semesterId, date, day_number: dayNumber };
  s.training_days.push(row);
  save(s);
  return row;
}

// Cadets
function getCadetsBySemesterId(semesterId) {
  return getState().cadets.filter((c) => c.semester_id === semesterId).sort((a, b) => a.name.localeCompare(b.name));
}
function getCadetById(id) {
  return getState().cadets.find((c) => c.id === id) || null;
}
function createCadet(record) {
  const s = getState();
  const id = nextId('cadets');
  const row = { id, ...record, created_at: new Date().toISOString() };
  s.cadets.push(row);
  save(s);
  return row;
}
function updateCadet(id, updates) {
  const s = getState();
  const i = s.cadets.findIndex((c) => c.id === id);
  if (i === -1) return null;
  Object.assign(s.cadets[i], updates);
  save(s);
  return s.cadets[i];
}

// Attendance
function getAttendanceByCadetId(cadetId) {
  return getState().attendance.filter((a) => a.cadet_id === cadetId);
}
function getAttendanceBySemesterId(semesterId) {
  const dayIds = getState().training_days.filter((d) => d.semester_id === semesterId).map((d) => d.id);
  return getState().attendance.filter((a) => dayIds.includes(a.training_day_id));
}
function setAttendance(cadetId, trainingDayId, status) {
  const s = getState();
  let row = s.attendance.find((a) => a.cadet_id === cadetId && a.training_day_id === trainingDayId);
  if (row) {
    row.status = status;
  } else {
    const id = nextId('attendance');
    row = { id, cadet_id: cadetId, training_day_id: trainingDayId, status };
    s.attendance.push(row);
  }
  save(s);
  return row;
}

module.exports = {
  getState,
  nextId,
  findUserByUsername,
  findUserById,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getSemesters,
  getSemesterById,
  createSemester,
  deleteSemester,
  getTrainingDaysBySemesterId,
  createTrainingDay,
  getCadetsBySemesterId,
  getCadetById,
  createCadet,
  updateCadet,
  getAttendanceByCadetId,
  getAttendanceBySemesterId,
  setAttendance,
};
