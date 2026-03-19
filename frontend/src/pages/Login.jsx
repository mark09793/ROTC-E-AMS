import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.left}>
          <div style={styles.crestWrap}>
          <img
            src="/rotcu-logo.png"
            alt="ROTCU Logo"
            style={styles.logo}
            className="spin-jump-animation"
          />
          </div>
          <h1 style={styles.title}>ROTC Attendance Monitoring System</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>
        <div style={styles.right}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={styles.input}
            />
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(0.75rem, 2vw, 1.25rem)',
    backgroundImage: 'linear-gradient(rgba(15, 23, 41, 0.55), rgba(15, 23, 41, 0.7)), url(/dmst-rotcE.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: 760,
    background: 'rgba(26, 39, 68, 0.28)',
    borderRadius: 12,
    padding: 'clamp(1rem, 3vw, 2rem)',
    border: '1px solid rgba(36, 53, 83, 0.85)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(0.75rem, 3vw, 1.5rem)',
    alignItems: 'center',
  },
  left: {
    flex: '1 1 320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  crestWrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  right: {
    flex: '1 1 320px',
    width: '100%',
  },
  logo: {
    width: 'clamp(140px, 18vw, 220px)',
    height: 'clamp(140px, 18vw, 220px)',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto 0.1rem',
  },
  title: {
    margin: '0 0 0.15rem',
    fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)',
    color: 'var(--cream)',
    textAlign: 'center',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(245,242,235,0.7)',
    textAlign: 'center',
    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)' },
  input: { width: '100%' },
  error: {
    padding: '0.5rem',
    background: 'rgba(127,29,29,0.3)',
    color: '#fca5a5',
    borderRadius: 6,
    fontSize: '0.9rem',
  },
  button: {
    marginTop: '0.5rem',
    background: 'var(--gold)',
    color: 'var(--navy)',
    padding: '0.75rem',
    fontSize: '1rem',
  },
  hint: {}, // removed content
};
