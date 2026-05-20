import { supabase } from '../supabase'

export async function usernameToEmail(username) {
  // Zamiast @beatquiz.pl używamy hash który wygląda jak prawdziwy email
  const encoded = btoa(username.toLowerCase()).replace(/[^a-z0-9]/gi, '').substring(0, 20)
  return `u${encoded}@bq-internal.com`
}

export async function register(username, password) {
  if (username.length < 3) throw new Error('Nazwa musi mieć min. 3 znaki')
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Tylko litery, cyfry i _')
  if (password.length < 6) throw new Error('Hasło musi mieć min. 6 znaków')

  // Sprawdź czy nazwa zajęta
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username)
    .single()
  if (existing) throw new Error('Ta nazwa jest już zajęta')

  const email = usernameToEmail(username)
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    if (error.message.includes('already registered')) throw new Error('Ta nazwa jest już zajęta')
    throw new Error('Błąd rejestracji: ' + error.message)
  }

  await supabase.from('profiles').insert({
    id: data.user.id,
    username,
  })
  return data.user
}

export async function login(username, password) {
  const email = usernameToEmail(username)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Zły login lub hasło')
  return data.user
}

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/set-username' }
  })
  if (error) throw new Error(error.message)
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  // Jeśli zalogowany przez Google ale nie ma jeszcze nazwy
  if (!profile) return { id: data.user.id, needsUsername: true, email: data.user.email }
  return profile
}

export async function setUsername(userId, username) {
  if (username.length < 3) throw new Error('Nazwa musi mieć min. 3 znaki')
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Tylko litery, cyfry i _')

  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username)
    .single()
  if (existing) throw new Error('Ta nazwa jest już zajęta')

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    username,
  })
  if (error) throw new Error('Błąd zapisu nazwy')
  return await getCurrentUser()
}

export async function updateStats(userId, { won, points }) {
  const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!p) return
  await supabase.from('profiles').update({
    games_played: p.games_played + 1,
    wins: p.wins + (won ? 1 : 0),
    losses: p.losses + (won ? 0 : 1),
    total_points: p.total_points + points,
    best_score: Math.max(p.best_score, points),
  }).eq('id', userId)
}

export async function getLeaderboard() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(50)
  return data || []
}
