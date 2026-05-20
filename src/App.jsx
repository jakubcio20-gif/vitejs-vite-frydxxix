import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './services/auth'
import { supabase } from './supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import SetUsername from './pages/SetUsername'
import SpotifyCallback from './pages/SpotifyCallback'
import Navbar from './components/Navbar'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(u => { setUser(u); setLoading(false) })
    supabase.auth.onAuthStateChange(() => {
      getCurrentUser().then(setUser)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #00ff87', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} onLogout={() => setUser(null)} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onAuth={setUser} />} />
          <Route path="/set-username" element={<SetUsername onAuth={setUser} />} />
          <Route path="/lobby" element={<Lobby user={user} />} />
          <Route path="/game/:code/:playerName" element={<Game user={user} />} />
          <Route path="/results/:code" element={<Results user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={setUser} />} />
          <Route path="/callback" element={<SpotifyCallback />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}