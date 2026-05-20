import { supabase } from '../supabase';

// Pomocnicza funkcja generująca losowy ID dla użytkownika (zamiast Supabase Auth)
function generateUUID() {
  return crypto.randomUUID();
}

export async function register(username, password) {
  if (username.length < 3) throw new Error('Nazwa musi mieć min. 3 znaki');
  if (password.length < 6) throw new Error('Hasło musi mieć min. 6 znaków');

  // 1. Sprawdzamy czy nazwa użytkownika jest wolna
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingUser) throw new Error('Nazwa użytkownika jest już zajęta');

  const fakeUserId = generateUUID();

  // 2. Wrzucamy użytkownika prosto do tabeli profiles
  const { error: profileError } = await supabase.from('profiles').insert({
    id: fakeUserId,
    username,
    password: password, // Zapisujemy hasło tekstowo na czas testów
    games_played: 0,
    wins: 0,
    losses: 0,
    total_points: 0,
    best_score: 0
  });

  if (profileError) throw new Error('Błąd podczas tworzenia profilu: ' + profileError.message);

  // 3. Zapisujemy ID usera w przeglądarce, żeby udawać sesję
  localStorage.setItem('beatquiz_user_id', fakeUserId);

  return { id: fakeUserId, username };
}

export async function login(username, password) {
  // Szukamy użytkownika bezpośrednio w tabeli profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if (error || !profile) {
    throw new Error('Zły login lub hasło');
  }

  // Zapisujemy "sesję" w localStorage
  localStorage.setItem('beatquiz_user_id', profile.id);

  return profile;
}

export async function logout() {
  localStorage.removeItem('beatquiz_user_id');
}

export async function getCurrentUser() {
  const savedUserId = localStorage.getItem('beatquiz_user_id');
  if (!savedUserId) return null;

  // Wyciągamy dane gracza z bazy na podstawie zapisanego ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', savedUserId)
    .maybeSingle();

  if (!profile) {
    localStorage.removeItem('beatquiz_user_id');
    return null;
  }

  return profile;
}

// --- PRZYWRÓCONE FUNKCJE GRY ---

export async function updateStats(userId, { won, points }) {
  const { data: p } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (!p) return;
  
  await supabase
    .from('profiles')
    .update({
      games_played: p.games_played + 1,
      wins: p.wins + (won ? 1 : 0),
      losses: p.losses + (won ? 0 : 1),
      total_points: p.total_points + points,
      best_score: Math.max(p.best_score, points),
    })
    .eq('id', userId);
}

export async function getLeaderboard() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(50);
    
  return data || [];
}