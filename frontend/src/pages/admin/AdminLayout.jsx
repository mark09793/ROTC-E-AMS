import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <img src="/rotcu-logo.png" alt="ROTCU Logo" style={styles.logo} />
          <div>
            <div style={styles.brand}>ROTC Attendance</div>
            <div style={styles.subbrand}>{isAdmin ? 'Administrator' : `${user?.campus || 'Campus'} ${user?.sex || ''}`}</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <NavLink to="/admin/upload" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
            {isAdmin ? 'Upload Attendance' : 'Attendance Monitoring'}
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/accounts" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
              Accounts
            </NavLink>
          )}
        </nav>
        <div style={styles.footer}>
          <div style={styles.user}>{user?.username}</div>
          <button type="button" onClick={onLogout} style={styles.logout}>Log out</button>
        </div>
      </aside>
      <main style={styles.main}>
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

const styles = {
  layout: { minHeight: '100vh', display: 'flex', flexWrap: 'wrap' },
  sidebar: {
    flex: '1 1 280px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: 'linear-gradient(180deg, var(--navy-mid), var(--navy))',
    borderRight: '1px solid var(--navy-light)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflow: 'hidden',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '0.85rem' },
  logo: { width: 80, height: 80, objectFit: 'contain' },
  brand: { fontWeight: 700, color: 'var(--gold)', fontSize: '1.05rem', lineHeight: 1.2 },
  subbrand: { fontSize: '0.8rem', color: 'rgba(245,242,235,0.75)', marginTop: '0.15rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' },
  navLink: {
    color: 'var(--cream)',
    textDecoration: 'none',
    padding: '0.8rem 0.9rem',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid transparent',
  },
  navLinkActive: { color: 'var(--gold)', fontWeight: 700, background: 'rgba(201,162,39,0.1)', borderColor: 'rgba(201,162,39,0.35)' },
  footer: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  user: { color: 'rgba(245,242,235,0.75)', fontSize: '0.9rem' },
  logout: { background: 'var(--navy-light)', color: 'var(--gold-light)', textAlign: 'left' },
  main: { flex: '999 1 520px', minHeight: 0, overflowY: 'auto', padding: '1.5rem' },
};
