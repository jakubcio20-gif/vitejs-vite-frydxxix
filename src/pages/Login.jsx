import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, loginWithGoogle, getCurrentUser } from '../services/auth'

export default function Login({ onAuth }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (tab === 'login') await login(username, password)
      else await register(username, password)
      const user = await getCurrentUser()
      onAuth(user)
      navigate('/')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try { await loginWithGoogle() }
    catch (e) { setError(e.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>
          {tab === 'login' ? 'ZALOGUJ SIĘ' : 'REJESTRACJA'}
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '12px', marginBottom: 20,
          background: '#fff', color: '#000', border: '1px solid #ddd',
          borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Kontynuuj przez Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
          <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#555570' }}>LUB</span>
          <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
        </div>

        <div style={{ display: 'flex', background: '#1a1a24', borderRadius: 6, padding: 4, marginBottom: 24 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '8px 0',
              background: tab === t ? '#00ff87' : 'transparent',
              color: tab === t ? '#000' : '#8888aa',
              borderRadius: 4, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            }}>{t === 'login' ? 'LOGOWANIE' : 'REJESTRACJA'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input className="input-field" placeholder="Nazwa użytkownika" value={username}
            onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <input className="input-field" type="password" placeholder="Hasło (min. 6 znaków)" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', borderRadius: 6, color: '#ff006e', fontSize: 13, fontFamily: 'DM Mono' }}>
              ⚠ {error}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : tab === 'login' ? '→ ZALOGUJ' : '→ ZAREJESTRUJ'}
          </button>
        </div>
      </div>
    </div>
  )
}
