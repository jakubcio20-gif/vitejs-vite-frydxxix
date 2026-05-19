import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Profile({ user, onUpdate }) {
  const navigate = useNavigate();
  if (!user)
    return (
      <div
        style={{
          minHeight: 'calc(100vh-60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            ZALOGUJ SIĘ
          </button>
        </div>
      </div>
    );

  const s = user;
  const winrate = s.games_played
    ? Math.round((s.wins / s.games_played) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-in">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff87, #00c8ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Bebas Neue',
              fontSize: 36,
              color: '#000',
            }}
          >
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: 40,
                letterSpacing: 2,
              }}
            >
              {user.username}
            </div>
            <div
              style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8888aa' }}
            >
              {s.games_played} gier rozegranych
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            { label: 'GIER', value: s.games_played, color: '#f0f0ff' },
            { label: 'WYGRANE', value: s.wins, color: '#00ff87' },
            { label: 'PRZEGRANE', value: s.losses, color: '#ff006e' },
            { label: 'WINRATE', value: `${winrate}%`, color: '#ffbe0b' },
            {
              label: 'SUMA PKT',
              value: (s.total_points || 0).toLocaleString(),
              color: '#00c8ff',
            },
            { label: 'NAJLEPSZY', value: s.best_score, color: '#00ff87' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{ padding: '20px 16px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 36,
                  color: stat.color,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono',
                  fontSize: 11,
                  color: '#8888aa',
                  letterSpacing: '0.1em',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => navigate('/')}
          >
            ▶ ZAGRAJ
          </button>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              await logout();
              onUpdate(null);
              navigate('/');
            }}
          >
            WYLOGUJ
          </button>
        </div>
      </div>
    </div>
  );
}
