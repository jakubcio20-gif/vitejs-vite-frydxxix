import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 60,
        background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid #2a2a3a',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link to="/">
        <span
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 28,
            color: '#00ff87',
            letterSpacing: 2,
          }}
        >
          BEATQUIZ
        </span>
        <span
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 16,
            color: '#8888aa',
            letterSpacing: 1,
            marginLeft: 6,
          }}
        >
          PL
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link
          to="/leaderboard"
          style={{
            fontFamily: 'DM Mono',
            fontSize: 13,
            color: location.pathname === '/leaderboard' ? '#00ff87' : '#8888aa',
          }}
        >
          RANKING
        </Link>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: '#1a1a24',
                border: '1px solid #2a2a3a',
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#00ff87',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'DM Mono',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {user.username[0].toUpperCase()}
              </span>
              <span style={{ fontFamily: 'DM Mono', fontSize: 13 }}>
                {user.username}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid #2a2a3a',
                borderRadius: 6,
                color: '#8888aa',
                fontFamily: 'DM Mono',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              WYLOGUJ
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            ZALOGUJ SIĘ
          </Link>
        )}
      </div>
    </nav>
  );
}
