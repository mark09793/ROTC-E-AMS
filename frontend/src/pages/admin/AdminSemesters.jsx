import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSemesters, uploadExcel, deleteSemester } from '../../api';

export default function AdminSemesters() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [semesterName, setSemesterName] = useState('');
  const [campus, setCampus] = useState('ECHAGUE');
  const [sex, setSex] = useState('MALE');
  const [error, setError] = useState('');

  useEffect(() => {
    getSemesters()
      .then(setSemesters)
      .catch(() => setError('Failed to load semesters'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file');
      return;
    }
    setError('');
    setUploading(true);
    try {
      await uploadExcel(file, semesterName || undefined, campus || undefined, sex || undefined);
      setFile(null);
      setSemesterName('');
      const list = await getSemesters();
      setSemesters(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (semester) => {
    const ok = window.confirm(`Delete semester "${semester.name}"? This will remove its cadets, attendance records, and linked cadet logins.`);
    if (!ok) return;
    setError('');
    try {
      await deleteSemester(semester.id);
      const list = await getSemesters();
      setSemesters(list);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 0.4rem', color: 'var(--gold)' }}>{user?.role === 'admin' ? 'Upload Attendance' : 'Attendance Monitoring'}</h1>

      {user?.role === 'admin' && (
        <section style={styles.uploadCard}>
          <h2 style={styles.uploadTitle}>Upload attendance Excel</h2>
          <p style={styles.uploadHint}>
            Excel format: Row 1 = headers. Column A = cadet name. Columns B–P = training days 1–15.
            Use 1 = Present, A = Absent, E = Excused, blank = upcoming training day.
          </p>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Semester name (optional)"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                style={styles.input}
              />
              <select value={campus} onChange={(e) => setCampus(e.target.value)} style={styles.input}>
                <option value="ECHAGUE">ECHAGUE</option>
                <option value="ANGADANAN">ANGADANAN</option>
                <option value="JONES">JONES</option>
                <option value="SANTIAGO EXTENSION">SANTIAGO EXTENSION</option>
              </select>
              <select value={sex} onChange={(e) => setSex(e.target.value)} style={styles.input}>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={styles.fileInput}
            />
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={uploading} style={styles.uploadBtn}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </section>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2 style={styles.listTitle}>Saved semesters</h2>
        {loading ? (
          <p style={{ color: 'var(--gold)' }}>Loading…</p>
        ) : semesters.length === 0 ? (
          <p style={{ color: 'rgba(245,242,235,0.6)' }}>No semesters yet. Upload an Excel file above.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Campus</th>
                  <th>Sex</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.campus || '—'}</td>
                    <td>{s.sex || '—'}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => navigate(`/admin/semesters/${s.id}`)} style={styles.viewBtn}>
                          View attendance
                        </button>
                        {user?.role === 'admin' && (
                          <button type="button" onClick={() => handleDelete(s)} style={styles.deleteBtn}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  uploadCard: {
    background: 'var(--navy-mid)',
    borderRadius: 12,
    padding: '1.5rem',
    border: '1px solid var(--navy-light)',
    width: '100%',
    maxWidth: '100%',
  },
  uploadTitle: { margin: '0 0 0.5rem', fontSize: '1.1rem' },
  uploadHint: { margin: '0 0 1rem', fontSize: '0.85rem', color: 'rgba(245,242,235,0.6)' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    width: '100%',
  },
  input: { width: '100%' },
  fileInput: { fontFamily: 'inherit', color: 'var(--cream)' },
  error: { padding: '0.5rem', background: 'rgba(127,29,29,0.3)', color: '#fca5a5', borderRadius: 6 },
  uploadBtn: { alignSelf: 'flex-start', background: 'var(--gold)', color: 'var(--navy)' },
  listTitle: { marginBottom: '0.75rem', fontSize: '1rem' },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--navy-light)',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.02)',
  },
  table: { width: '100%', minWidth: 720 },
  viewBtn: { background: 'var(--navy-light)', color: 'var(--gold-light)' },
  deleteBtn: { background: 'var(--dropped)', color: 'white' },
};
