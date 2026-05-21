import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, getRandomSongs } from '../data/songs'
import { createRoom } from '../services/room'

export default function Lobby({ user }) {
  const navigate = useNavigate()
  const [category, setCategory] = useState('rap')
  const [roundCount, setRoundCount] = useState(5)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  if (!user) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, marginBottom: 16 }}>MUSISZ BYĆ ZALOGOWANY</div>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>ZALOGUJ SIĘ</button>
      </div>
    </div>
  )

  const handleCreate = async () => {
    setCreating(true); setError('')
    try {
      const songs = getRandomSongs(category, roundCount)
      const room = await createRoom(user.username, songs, category)
      navigate(`/game/${room.code}/${user.username}?role=host`)
    } catch (e) { setError(e.message) }
    finally { setCreating(false) }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-in">
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 3, marginBottom: 40 }}>NOWA GRA</div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8888aa', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>KATEGORIA</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setCategory(key)} style={{
                padding: '16px 8px', borderRadius: 8,
                border: `2px solid ${category === key ? cat.color : '#2a2a3a'}`,
                background: category === key ? `${cat.color}15` : '#1a1a24',
                color: category === key ? cat.color : '#8888aa',
                cursor: 'pointer', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{cat.emoji}</div>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#8888aa', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>
            LICZBA RUND: <span style={{ color: '#00ff87' }}>{roundCount}</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 5, 7, 10].map(n => (
              <button key={n} onClick={() => setRoundCount(n)} style={{
                flex: 1, padding: '10px 0',
                background: roundCount === n ? '#00ff87' : '#1a1a24',
                color: roundCount === n ? '#000' : '#8888aa',
                border: `1px solid ${roundCount === n ? '#00ff87' : '#2a2a3a'}`,
                borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Mono', fontWeight: 700, fontSize: 15,
              }}>{n}</button>
            ))}
          </div>
        </div>

        {error && <div style={{ padding: '10px 14px', marginBottom: 16, background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', borderRadius: 6, color: '#ff006e', fontSize: 13, fontFamily: 'DM Mono' }}>⚠ {error}</div>}

        <button className="btn btn-primary" style={{ width: '100%', fontSize: 16, padding: '16px', opacity: creating ? 0.7 : 1 }}
          onClick={handleCreate} disabled={creating}>
          {creating ? 'TWORZĘ POKÓJ...' : '▶ STWÓRZ POKÓJ'}
        </button>
      </div>
    </div>
  )
}
