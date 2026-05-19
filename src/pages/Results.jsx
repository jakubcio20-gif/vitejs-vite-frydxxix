import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom } from '../services/room';
import { updateStats } from '../services/auth';

export default function Results({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    getRoom(code).then((r) => {
      if (!r) {
        navigate('/');
        return;
      }
      setRoom(r);
      if (user) {
        const scores = r.scores || {};
        const myScore = scores[user.username] || 0;
        const oppScore =
          Object.entries(scores).find(([k]) => k !== user.username)?.[1] || 0;
        updateStats(user.id, { won: myScore > oppScore, points: myScore });
      }
    });
  }, []);

  if (!room) return null;
  const scores = room.scores || {};
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const winner = sorted[0]?.[0];
  const isTie = sorted.length > 1 && sorted[0][1] === sorted[1][1];

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div className="fade-in">
        <div
          style={{ fontFamily: 'Bebas Neue', fontSize: 72, marginBottom: 8 }}
        >
          {isTie ? '🤝' : '🏆'}
        </div>
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 48,
            letterSpacing: 3,
            marginBottom: 40,
          }}
        >
          {isTie ? 'REMIS!' : `${winner} WYGRYWA!`}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {sorted.map(([name, score], i) => (
            <div
              key={name}
              className="card"
              style={{
                padding: '28px 36px',
                flex: 1,
                maxWidth: 200,
                borderColor: i === 0 && !isTie ? '#00ff87' : '#2a2a3a',
              }}
            >
              {i === 0 && !isTie && (
                <div style={{ fontSize: 24, marginBottom: 8 }}>👑</div>
              )}
              <div
                style={{ fontFamily: 'DM Mono', fontSize: 14, marginBottom: 8 }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 56,
                  color: i === 0 && !isTie ? '#00ff87' : '#f0f0ff',
                }}
              >
                {score}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono',
                  fontSize: 11,
                  color: '#8888aa',
                }}
              >
                PUNKTÓW
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/lobby')}
          >
            ▶ ZAGRAJ ZNOWU
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/leaderboard')}
          >
            🏆 RANKING
          </button>
        </div>
      </div>
    </div>
  );
}
