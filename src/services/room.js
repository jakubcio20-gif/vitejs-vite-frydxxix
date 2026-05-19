import { supabase } from '../supabase';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(hostName, songs, category) {
  const code = generateCode();
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      host_name: hostName,
      category,
      songs,
      total_rounds: songs.length,
      status: 'playing',
      scores: { [hostName]: 0 },
      round_results: [],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function joinRoom(code, guestName) {
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  if (!room) throw new Error('Nie ma takiego pokoju');
  if (room.status !== 'playing') throw new Error('Gra już skończona');
  if (room.guest_name) throw new Error('Pokój pełny');

  const newScores = { ...room.scores, [guestName]: 0 };
  const { data, error } = await supabase
    .from('rooms')
    .update({ guest_name: guestName, scores: newScores })
    .eq('code', code.toUpperCase())
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getRoom(code) {
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  return data;
}

export async function recordRoundResult(
  code,
  playerName,
  points,
  attemptIndex,
  timeSeconds,
  guessed
) {
  const room = await getRoom(code);
  if (!room) return;

  const newScores = {
    ...room.scores,
    [playerName]: (room.scores[playerName] || 0) + points,
  };
  const newResults = [
    ...room.round_results,
    {
      round: room.current_round,
      player: playerName,
      points,
      attemptIndex,
      timeSeconds,
      guessed,
    },
  ];

  const players = [room.host_name, room.guest_name].filter(Boolean);
  const roundDone = players.every((p) =>
    newResults.find((r) => r.round === room.current_round && r.player === p)
  );

  let updates = { scores: newScores, round_results: newResults };

  if (roundDone) {
    const nextRound = room.current_round + 1;
    if (nextRound >= room.total_rounds) {
      updates.status = 'finished';
    } else {
      updates.current_round = nextRound;
    }
  }

  const { data } = await supabase
    .from('rooms')
    .update(updates)
    .eq('code', code.toUpperCase())
    .select()
    .single();
  return data;
}
