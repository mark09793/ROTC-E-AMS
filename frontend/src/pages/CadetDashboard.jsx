import React, { useState, useEffect } from 'react';
import { getMyAttendance } from '../api';

export default function CadetDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyAttendance()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load your attendance'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--gold)', padding: '2rem' }}>Loading…</p>;
  if (error && !data) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: '#fca5a5' }}>{error}</p>
        <p style={{ color: 'rgba(245,242,235,0.6)' }}>Your account may not be linked to a cadet record. Ask an administrator to create your login and link it to your record.</p>
      </div>
    );
  }
  if (!data) return null;

  const { cadet, semester, records } = data;

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.brand}>ROTC Attendance — Cadet</div>
        <div style={styles.nav}>
          <span style={styles.user}>{user?.username}</span>
          <button type="button" onClick={onLogout} style={styles.logout}>Log out</button>
        </div>
      </header>
      <main style={styles.main}>
        <h1 style={styles.title}>My Attendance</h1>
        <p style={styles.subtitle}>{semester?.name}</p>

        <div style={styles.summary}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Total absences</span>
            <span style={styles.cardValue}>{cadet.total_absences}</span>
          </div>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Excused</span>
            <span style={styles.cardValue}>{cadet.excused_count}</span>
          </div>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Equivalent absences</span>
            <span style={styles.cardValue}>{cadet.equivalent_absences}</span>
            <span style={styles.cardHint}>(3 excused = 1 absence)</span>
          </div>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Status</span>
            <span className={`badge badge-${cadet.status.toLowerCase()}`} style={styles.badge}>{cadet.status}</span>
          </div>
        </div>

        <section style={styles.tableSection}>
          <h2 style={styles.tableTitle}>Training days</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const status = r.status || null;
                return (
                  <tr key={i}>
                    <td>{r.day_number}</td>
                    <td>{r.date}</td>
                    <td>
                      {status ? (
                        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                      ) : (
                        <span style={{ color: 'rgba(245,242,235,0.4)', fontSize: '0.8rem' }}>Upcoming</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {(cadet.status === 'Warning' || cadet.status === 'Dropped') && (
          <div style={styles.alert}>
            {cadet.status === 'Warning' && (
              <p>You are under <strong>Warning (Running for Drop)</strong>. One more absence will result in Dropped status.</p>
            )}
            {cadet.status === 'Dropped' && (
              <p>You have reached <strong>Dropped</strong> status due to attendance. Contact your ROTC unit for next steps.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: 'var(--navy-mid)',
    borderBottom: '1px solid var(--navy-light)',
  },
  brand: { fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem' },
  nav: { display: 'flex', alignItems: 'center', gap: '1rem' },
  user: { color: 'rgba(245,242,235,0.7)', fontSize: '0.9rem' },
  logout: { background: 'transparent', color: 'var(--gold-light)' },
  main: { flex: 1, padding: '1.5rem', maxWidth: 720, margin: '0 auto', width: '100%' },
  title: { marginBottom: '0.25rem', color: 'var(--gold)' },
  subtitle: { marginBottom: '1.5rem', color: 'rgba(245,242,235,0.6)' },
  summary: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: {
    background: 'var(--navy-mid)',
    borderRadius: 10,
    padding: '1rem',
    border: '1px solid var(--navy-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  cardLabel: { fontSize: '0.8rem', color: 'var(--gold)' },
  cardValue: { fontSize: '1.5rem', fontWeight: 700 },
  cardHint: { fontSize: '0.75rem', color: 'rgba(245,242,235,0.5)' },
  badge: { alignSelf: 'flex-start' },
  tableSection: { marginBottom: '2rem' },
  tableTitle: { marginBottom: '0.75rem', fontSize: '1rem' },
  table: {},
  alert: {
    padding: '1rem',
    background: 'rgba(180, 83, 9, 0.2)',
    border: '1px solid var(--warning)',
    borderRadius: 8,
    color: 'var(--cream)',
  },
};
