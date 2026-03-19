import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function AdminLayout({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
      {isMobile && (
        <div style={styles.mobileTopBar}>
          <div style={styles.mobileBrandWrap}>
            <img src="/rotcu-logo.png" alt="ROTCU Logo" style={styles.mobileLogo} />
            <div style={styles.mobileTitle}>ROTC Attendance</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={styles.mobileLogout}
          >
            Log out
          </button>
        </div>
      )}
      {!isMobile && (
        <aside
          style={{
            ...styles.sidebar,
          }}
        >
          <div style={styles.logoWrap}>
          <img src="/rotcu-logo.png" alt="ROTCU Logo" style={styles.logo} />
          <div>
            <div style={styles.brand}>ROTC Attendance</div>
            <div style={styles.subbrand}>{isAdmin ? 'Administrator' : `${user?.campus || 'Campus'} ${user?.sex || ''}`}</div>
          </div>
          </div>
          <nav style={styles.nav}>
          <NavLink
            to="/admin/upload"
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
            onClick={() => setSidebarOpen(false)}
          >
            {isAdmin ? 'Upload Attendance' : 'Attendance Monitoring'}
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin/accounts"
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
              onClick={() => setSidebarOpen(false)}
            >
              Accounts
            </NavLink>
          )}
          </nav>
          <div style={styles.footer}>
          <div style={styles.user}>{user?.username}</div>
          <button type="button" onClick={onLogout} style={styles.logout}>Log out</button>
          </div>
        </aside>
      )}
      <main
        style={{
          ...styles.main,
          minHeight: isMobile ? 'calc(100vh - 56px)' : 0,
          paddingTop: isMobile ? '0.75rem' : '1.5rem',
        }}
      >
        {isMobile && (
          <div style={styles.mobileNavRow}>
            <button
              type="button"
              style={styles.mobileNavButton}
              onClick={() => navigate('/admin/upload')}
            >
              {isAdmin ? 'Upload Attendance' : 'Attendance Monitoring'}
            </button>
            {isAdmin && (
              <button
                type="button"
                style={styles.mobileNavButton}
                onClick={() => navigate('/admin/accounts')}
              >
                Accounts
              </button>
            )}
          </div>
        )}
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

const styles = {
  layout: { minHeight: '100vh', display: 'flex', flexWrap: 'wrap' },
  mobileTopBar: {
    height: 56,
    padding: '0 0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--navy-mid)',
    borderBottom: '1px solid var(--navy-light)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  mobileTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--gold)',
  },
  mobileBrandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogo: {
    width: 28,
    height: 28,
    objectFit: 'contain',
  },
  burger: {
    width: 36,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--navy-light)',
    background: 'rgba(15,23,42,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  burgerLine: {
    width: 18,
    height: 2,
    borderRadius: 999,
    background: 'var(--cream)',
  },
  mobileLogout: {
    padding: '0.35rem 0.75rem',
    borderRadius: 999,
    border: '1px solid var(--navy-light)',
    background: 'var(--navy-light)',
    color: 'var(--gold-light)',
    fontSize: '0.8rem',
  },
  mobileNavRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  mobileNavButton: {
    flex: '1 1 120px',
    padding: '0.5rem 0.75rem',
    borderRadius: 999,
    border: '1px solid var(--navy-light)',
    background: 'rgba(15,23,42,0.9)',
    color: 'var(--cream)',
    fontSize: '0.8rem',
  },
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
