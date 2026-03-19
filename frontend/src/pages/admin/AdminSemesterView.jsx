import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { getSemesterAttendance, updateAttendance } from '../../api';

export default function AdminSemesterView() {
  const { user } = useOutletContext();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // { cadetId, dayId }
  const [newStatus, setNewStatus] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL | WARNING | DROPPED

  useEffect(() => {
    if (!id) return;
    getSemesterAttendance(id)
      .then(setData)
      .catch(() => setError('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!editing || !newStatus) return;
    try {
      await updateAttendance(editing.cadetId, editing.trainingDayId, newStatus);
      const fresh = await getSemesterAttendance(id);
      setData(fresh);
      setEditing(null);
      setNewStatus('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ color: 'var(--gold)' }}>Loading…</p>;
  if (error && !data) return <p style={{ color: '#fca5a5' }}>{error}</p>;
  if (!data) return null;

  const isAdmin = user?.role === 'admin';
  const { semester, days, cadets } = data;
  const warningCount = cadets.filter((c) => (c.status || '').toLowerCase() === 'warning').length;
  const droppedCount = cadets.filter((c) => (c.status || '').toLowerCase() === 'dropped').length;
  const filteredCadets = cadets.filter((c) => {
    const s = (c.status || '').toLowerCase();
    if (filter === 'WARNING') return s === 'warning';
    if (filter === 'DROPPED') return s === 'dropped';
    return true;
  });

  return (
    <div>
      <h1 style={{ margin: '0 0 0.25rem', color: 'var(--gold)' }}>{semester.name}</h1>
      <p style={{ marginBottom: '0.75rem', color: 'rgba(245,242,235,0.6)' }}>
        <span style={{ fontWeight: 800, color: 'rgba(245,242,235,0.85)' }}>Monitoring table —</span> 3 excused = 1 absence; 4 absences = Warning; 5+ = Dropped
      </p>
      {error && <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(127,29,29,0.3)', color: '#fca5a5', borderRadius: 6 }}>{error}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setFilter((prev) => (prev === 'WARNING' ? 'ALL' : 'WARNING'))}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 12,
            border: filter === 'WARNING' ? '1px solid rgba(201,162,39,0.6)' : '1px solid var(--navy-light)',
            background: filter === 'WARNING' ? 'rgba(201,162,39,0.16)' : 'rgba(255,255,255,0.03)',
            color: 'var(--cream)',
            minWidth: 220,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.75)', fontWeight: 700 }}>Warning students</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{warningCount}</div>
        </button>
        <button
          type="button"
          onClick={() => setFilter((prev) => (prev === 'DROPPED' ? 'ALL' : 'DROPPED'))}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 12,
            border: filter === 'DROPPED' ? '1px solid rgba(201,162,39,0.6)' : '1px solid var(--navy-light)',
            background: filter === 'DROPPED' ? 'rgba(201,162,39,0.16)' : 'rgba(255,255,255,0.03)',
            color: 'var(--cream)',
            minWidth: 220,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'rgba(245,242,235,0.75)', fontWeight: 700 }}>Dropped students</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{droppedCount}</div>
        </button>
        {filter !== 'ALL' && (
          <button type="button" onClick={() => setFilter('ALL')} style={{ background: 'var(--navy-light)', color: 'var(--gold-light)' }}>
            Show all
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: 800, fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'var(--navy-mid)', zIndex: 1 }}>Cadet name</th>
              {days.map((d) => (
                <th key={d.day_number} title={d.date}>{d.date}</th>
              ))}
              <th>Absences</th>
              <th>Excused</th>
              <th>Equiv. abs.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCadets.map((c) => (
              <tr key={c.id}>
                <td style={{ position: 'sticky', left: 0, background: 'var(--navy)', fontWeight: 600 }}>{c.name}</td>
                {days.map((d) => {
                  const rawStatus = c.byDay[d.day_number];
                  const status = rawStatus || null;
                  const isEditing = editing?.cadetId === c.id && editing?.dayNumber === d.day_number;
                  return (
                    <td key={d.day_number}>
                      {isAdmin && isEditing ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ padding: 2, fontSize: '0.8rem' }}>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Excused">Excused</option>
                          </select>
                          <button type="button" onClick={handleUpdateStatus} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>Save</button>
                          <button type="button" onClick={() => setEditing(null)} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>Cancel</button>
                        </div>
                      ) : status ? (
                        <span
                          className={`badge badge-${status.toLowerCase()}`}
                          style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (!isAdmin) return;
                            setEditing({ cadetId: c.id, trainingDayId: d.id, dayNumber: d.day_number });
                            setNewStatus(status);
                          }}
                          title={isAdmin ? 'Click to edit' : undefined}
                        >
                          {status.charAt(0)}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(245,242,235,0.4)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  );
                })}
                <td>{c.total_absences}</td>
                <td>{c.excused_count}</td>
                <td>{c.equivalent_absences}</td>
                <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
