import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/auth';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  useEffect(() => {
    getLeaderboard().then(setBoard);
  }, []);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-in">
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 48,
            letterSpacing: 3,
            marginBottom: 4,
          }}
        >
          RANKING
        </div>
        <p
          style={{
            color: '#8888aa',
            fontFamily: 'DM Mono',
            fontSize: 13,
            marginBottom: 40,
          }}
        >
          Top gracze · punkty łączne
        </p>
        {board.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏜️</div>
            <div style={{ fontFamily: 'DM Mono', color: '#8888aa' }}>
              Brak graczy jeszcze!
            </div>
          </div>
        ) : (
          board.map((p, i) => (
            <div
              key={p.username}
              className="card"
              style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 8,
                borderColor: i === 0 ? 'rgba(255,190,11,0.4)' : '#2a2a3a',
              }}
            >
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 28,
                  minWidth: 48,
                  textAlign: 'center',
                  color:
                    i < 3 ? ['#ffbe0b', '#aaaacc', '#ff8844'][i] : '#555570',
                }}
              >
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 15 }}>
                  {p.username}
                </div>
                <div
                  style={{
                    fontFamily: 'DM Mono',
                    fontSize: 11,
                    color: '#8888aa',
                    marginTop: 2,
                  }}
                >
                  {p.games_played} gier · {p.wins}W / {p.losses}L
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: 32,
                    color: i === 0 ? '#ffbe0b' : '#f0f0ff',
                  }}
                >
                  {p.total_points.toLocaleString()}
                </div>
                <div
                  style={{
                    fontFamily: 'DM Mono',
                    fontSize: 11,
                    color: '#8888aa',
                  }}
                >
                  PKT · najlepszy {p.best_score}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
