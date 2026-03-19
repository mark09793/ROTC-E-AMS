const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders(includeAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
  return headers;
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function getSemesters() {
  const res = await fetch(`${API}/admin/semesters`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load semesters');
  return res.json();
}

export async function uploadExcel(file, semesterName, campus, sex) {
  const form = new FormData();
  form.append('file', file);
  if (semesterName) form.append('semesterName', semesterName);
  if (campus) form.append('campus', campus);
  if (sex) form.append('sex', sex);
  const res = await fetch(`${API}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || (res.status === 401 ? 'Session expired. Please log in again.' : 'Upload failed');
    throw new Error(msg);
  }
  return data;
}

export async function getSemesterAttendance(semesterId) {
  const res = await fetch(`${API}/admin/semesters/${semesterId}/attendance`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load attendance');
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API}/admin/users`, { headers: getHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to load accounts');
  return data;
}

export async function deleteSemester(semesterId) {
  const res = await fetch(`${API}/admin/semesters/${semesterId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

export async function updateAttendance(cadetId, trainingDayId, status) {
  const res = await fetch(`${API}/admin/attendance/${cadetId}/${trainingDayId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function updateUser(userId, payload) {
  const res = await fetch(`${API}/admin/users/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function deleteUser(userId) {
  const res = await fetch(`${API}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

export async function getMyAttendance() {
  const res = await fetch(`${API}/cadet/me/attendance`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load attendance');
  return res.json();
}
