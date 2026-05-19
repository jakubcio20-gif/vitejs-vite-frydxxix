import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getCurrentUser } from '../services/auth';

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') await login(username, password);
      else await register(username, password);
      const user = await getCurrentUser();
      onAuth(user);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="card fade-in"
        style={{ width: '100%', maxWidth: 400, padding: 40 }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 36,
            letterSpacing: 3,
            marginBottom: 32,
          }}
        >
          {tab === 'login' ? 'ZALOGUJ SIĘ' : 'REJESTRACJA'}
        </div>
        <div
          style={{
            display: 'flex',
            background: '#1a1a24',
            borderRadius: 6,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                background: tab === t ? '#00ff87' : 'transparent',
                color: tab === t ? '#000' : '#8888aa',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Mono',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              {t === 'login' ? 'LOGOWANIE' : 'REJESTRACJA'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            className="input-field"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(255,0,110,0.1)',
                border: '1px solid rgba(255,0,110,0.3)',
                borderRadius: 6,
                color: '#ff006e',
                fontSize: 13,
                fontFamily: 'DM Mono',
              }}
            >
              ⚠ {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : tab === 'login' ? '→ ZALOGUJ' : '→ ZAREJESTRUJ'}
          </button>
        </div>
      </div>
    </div>
  );
}
