import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../services/spotify';

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Łączę ze Spotify...');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      exchangeCodeForToken(code)
        .then(() => {
          setStatus('✅ Połączono!');
          setTimeout(() => navigate('/lobby'), 1000);
        })
        .catch((e) => {
          setStatus('Błąd: ' + e.message);
          setTimeout(() => navigate('/lobby'), 2000);
        });
    }
  }, []);
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #00ff87',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }}
        />
        <div style={{ fontFamily: 'DM Mono', color: '#8888aa' }}>{status}</div>
      </div>
    </div>
  );
}
