import React, { useEffect, useState } from 'react';
import { deleteUser, getUsers, updateUser } from '../../api';

const CAMPUSES = ['ECHAGUE', 'ANGADANAN', 'JONES', 'SANTIAGO EXTENSION'];
const SEXES = ['MALE', 'FEMALE'];

export default function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', campus: '', sex: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username || '',
      password: '',
      campus: user.campus || '',
      sex: user.sex || '',
    });
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateUser(editing.id, {
        username: form.username,
        password: form.password || undefined,
        campus: form.campus || null,
        sex: form.sex || null,
      });
      setEditing(null);
      setForm({ username: '', password: '', campus: '', sex: '' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    const ok = window.confirm(`Delete account "${user.username}"?`);
    if (!ok) return;
    try {
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>Accounts</h1>
      <p style={{ marginBottom: '1rem', color: 'rgba(245,242,235,0.7)' }}>
        Manage campus and admin logins. Campus accounts are automatically scoped to their campus and sex.
      </p>

      {editing && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Edit account</h2>
          <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>Username</label>
            <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />

            <label style={styles.label}>New password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />

            {editing.role === 'campus' && (
              <>
                <label style={styles.label}>Campus</label>
                <select value={form.campus} onChange={(e) => setForm((p) => ({ ...p, campus: e.target.value }))}>
                  <option value="">Select campus</option>
                  {CAMPUSES.map((campus) => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>

                <label style={styles.label}>Sex</label>
                <select value={form.sex} onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value }))}>
                  <option value="">Select sex</option>
                  {SEXES.map((sex) => (
                    <option key={sex} value={sex}>{sex}</option>
                  ))}
                </select>
              </>
            )}

            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.actions}>
              <button type="submit" style={styles.saveBtn}>Save</button>
              <button type="button" onClick={() => setEditing(null)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <p style={{ color: 'var(--gold)' }}>Loading…</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Campus</th>
                <th>Sex</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.campus || '—'}</td>
                  <td>{user.sex || '—'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={styles.rowActions}>
                      <button type="button" onClick={() => startEdit(user)} style={styles.editBtn}>Edit</button>
                      {user.role !== 'admin' && (
                        <button type="button" onClick={() => handleDelete(user)} style={styles.deleteBtn}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--navy-mid)',
    border: '1px solid var(--navy-light)',
    borderRadius: 12,
    padding: '1rem',
    marginBottom: '1.25rem',
    maxWidth: 640,
  },
  cardTitle: { margin: '0 0 0.75rem', color: 'var(--gold)' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 420 },
  label: { fontSize: '0.9rem', color: 'var(--gold-light)' },
  actions: { display: 'flex', gap: '0.6rem', marginTop: '0.4rem' },
  saveBtn: { background: 'var(--gold)', color: 'var(--navy)' },
  cancelBtn: { background: 'var(--navy-light)', color: 'var(--cream)' },
  editBtn: { background: 'var(--navy-light)', color: 'var(--gold-light)' },
  deleteBtn: { background: 'var(--dropped)', color: 'white' },
  rowActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  error: { padding: '0.5rem', borderRadius: 6, background: 'rgba(127,29,29,0.35)', color: '#fca5a5' },
};
