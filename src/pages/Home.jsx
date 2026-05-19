import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/songs';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
      <div
        style={{ textAlign: 'center', marginBottom: 64 }}
        className="fade-in"
      >
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 'clamp(64px, 12vw, 120px)',
            lineHeight: 0.9,
            letterSpacing: 4,
            background: 'linear-gradient(135deg, #00ff87 0%, #00c8ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 16,
          }}
        >
          BEAT
          <br />
          QUIZ
        </div>
        <p
          style={{
            color: '#8888aa',
            fontFamily: 'DM Mono',
            fontSize: 15,
            letterSpacing: '0.1em',
          }}
        >
          ZGADUJ POLSKIE PIOSENKI · 1V1 · RANKING
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 48,
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <div
            key={key}
            style={{
              padding: '8px 20px',
              borderRadius: 99,
              border: `1px solid ${cat.color}44`,
              background: `${cat.color}11`,
              color: cat.color,
              fontFamily: 'DM Mono',
              fontSize: 13,
              letterSpacing: '0.1em',
            }}
          >
            {cat.emoji} {cat.label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 32 }}>
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 28,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            NOWA GRA
          </div>
          <p
            style={{
              color: '#8888aa',
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Stwórz pokój i zaproś znajomego kodem.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate(user ? '/lobby' : '/login')}
          >
            ▶ STWÓRZ POKÓJ
          </button>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 28,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            DOŁĄCZ
          </div>
          <p
            style={{
              color: '#8888aa',
              fontSize: 14,
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            Masz kod od znajomego?
          </p>
          <input
            className="input-field"
            placeholder="KOD POKOJU"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              marginBottom: 10,
              textAlign: 'center',
              letterSpacing: 4,
              fontSize: 18,
            }}
            maxLength={6}
          />
          {!user && (
            <input
              className="input-field"
              placeholder="Twoja nazwa"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{ marginBottom: 10 }}
            />
          )}
          <button
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              if (!joinCode) return;
              const name = user ? user.username : guestName;
              if (!name) return;
              navigate(`/game/${joinCode}/${name}?role=guest`);
            }}
          >
            → DOŁĄCZ
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 22,
            letterSpacing: 2,
            marginBottom: 20,
            color: '#8888aa',
          }}
        >
          JAK GRAĆ?
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
          }}
        >
          {[
            { time: '0.1s', mult: '×1.0', color: '#00ff87' },
            { time: '0.5s', mult: '×0.8', color: '#00e077' },
            { time: '1s', mult: '×0.6', color: '#ffbe0b' },
            { time: '3s', mult: '×0.4', color: '#ff8800' },
            { time: '10s', mult: '×0.2', color: '#ff006e' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '16px 8px',
                background: '#1a1a24',
                borderRadius: 8,
                border: `1px solid ${s.color}33`,
              }}
            >
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 22,
                  color: s.color,
                }}
              >
                {s.time}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono',
                  fontSize: 11,
                  color: '#8888aa',
                  marginTop: 4,
                }}
              >
                Próba {i + 1}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono',
                  fontSize: 13,
                  color: s.color,
                  marginTop: 6,
                  fontWeight: 700,
                }}
              >
                {s.mult}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
