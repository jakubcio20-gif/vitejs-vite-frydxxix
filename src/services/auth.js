import { supabase } from '../supabase';

export async function register(username, password) {
  if (username.length < 3) throw new Error('Nazwa musi mieć min. 3 znaki');
  if (password.length < 6) throw new Error('Hasło musi mieć min. 6 znaków');

  const email = `${username.toLowerCase()}@beatquiz.pl`;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username,
  });
  if (profileError) throw new Error('Nazwa już zajęta');
  return data.user;
}

export async function login(username, password) {
  const email = `${username.toLowerCase()}@beatquiz.pl`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error('Zły login lub hasło');
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  return profile;
}

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
