import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, setUsername } from '../services/auth'

export default function SetUsername({ onAuth }) {
  const navigate = useNavigate()
  const [username, setUsernameVal] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { navigate('/login'); return }
      if (!u.needsUsername) { onAuth(u); navigate('/'); return }
      setUserId(u.id)
    })
  }, [])

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      const user = await setUsername(userId, username)
      onAuth(user)
      navigate('/')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>WYBIERZ NAZWĘ</div>
        <p style={{ color: '#8888aa', fontFamily: 'DM Mono', fontSize: 13, marginBottom: 28 }}>
          Jak mają cię widzieć inni gracze?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input className="input-field" placeholder="Nazwa użytkownika" value={username}
            onChange={e => setUsernameVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus />
          <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#555570' }}>
            Tylko litery, cyfry i _ · min. 3 znaki
          </div>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', borderRadius: 6, color: '#ff006e', fontSize: 13, fontFamily: 'DM Mono' }}>
              ⚠ {error}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : '→ GOTOWE'}
          </button>
        </div>
      </div>
    </div>
  )
}