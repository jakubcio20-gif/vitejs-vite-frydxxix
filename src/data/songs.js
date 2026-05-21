export const SONGS = [
  // RAP
  { id: 's1', title: 'Następna Stacja', artist: 'Taco Hemingway', category: 'rap', youtubeId: 'TZgBIbqtDnQ', youtubeStart: 0 },
  { id: 's2', title: 'POLSKIE TANGO', artist: 'Taco Hemingway', category: 'rap', youtubeId: 'i84L16VL6c8', youtubeStart: 3 },
  { id: 's3', title: 'Żyć aż do bólu', artist: 'Chada', category: 'rap', youtubeId: 's35kfWoHDhM', youtubeStart: 0 },
  { id: 's4', title: 'Patointeligencja', artist: 'Mata', category: 'rap', youtubeId: 'wTAibxp37vE', youtubeStart: 5 },
  { id: 's5', title: 'Jestem Bogiem', artist: 'Paktofonika', category: 'rap', youtubeId: 'u3HeJFr01T0', youtubeStart: 0 },
  { id: 's6', title: 'Język Ciała', artist: 'Tymek ft. Big Scythe', category: 'rap', youtubeId: 'pImrABc4s58', youtubeStart: 0 },
  // POP
  { id: 'p1', title: 'Małomiasteczkowy', artist: 'Dawid Podsiadło', category: 'pop', youtubeId: 'P7jT_dFmRTM', youtubeStart: 25 },
  { id: 'p2', title: 'Phantom Liberty', artist: 'Dawid Podsiadło', category: 'pop', youtubeId: '2VdSdxkjcSA', youtubeStart: 20 },
  { id: 'p3', title: 'Niezapominajka', artist: 'Sanah', category: 'pop', youtubeId: 'cQMHDDCKGj4', youtubeStart: 15 },
  { id: 'p4', title: 'Królowa Łez', artist: 'Sanah', category: 'pop', youtubeId: 'Ov5vFSp7TOM', youtubeStart: 20 },
  { id: 'p5', title: 'Komety', artist: 'Dawid Podsiadło ft. Taco Hemingway', category: 'pop', youtubeId: 'CpHBBCrJpd0', youtubeStart: 30 },
  { id: 'p6', title: 'Nie Pytaj O Miłość', artist: 'Dawid Podsiadło', category: 'pop', youtubeId: 'tQoFGv0xBZc', youtubeStart: 20 },
  { id: 'p7', title: 'Szampan', artist: 'Sanah', category: 'pop', youtubeId: 'fxHBmMEXiL8', youtubeStart: 15 },
  // KLASYKI
  { id: 'k1', title: 'Autobiografia', artist: 'Myslovitz', category: 'klasyki', youtubeId: 'WN4KDkEq-V8', youtubeStart: 20 },
  { id: 'k2', title: 'Jolka Jolka Pamiętasz', artist: 'Budka Suflera', category: 'klasyki', youtubeId: 'uKqC_hkbheo', youtubeStart: 30 },
  { id: 'k3', title: 'Wehikuł Czasu', artist: 'Perfect', category: 'klasyki', youtubeId: 'j7VCpYTISjE', youtubeStart: 25 },
  { id: 'k4', title: 'Kolorowe Jarmarki', artist: 'Maanam', category: 'klasyki', youtubeId: 'X7hKhbZhrJE', youtubeStart: 15 },
  { id: 'k5', title: 'Lipstick on the Glass', artist: 'Maanam', category: 'klasyki', youtubeId: 'aOCxZDT6bV4', youtubeStart: 20 },
  { id: 'k6', title: 'Wróżka', artist: 'Hey', category: 'klasyki', youtubeId: 'W5m0mkR3uGM', youtubeStart: 15 },
  { id: 'k7', title: 'Takin Care of Business', artist: 'Lady Pank', category: 'klasyki', youtubeId: 'uF6kCyFkudQ', youtubeStart: 20 },
]

export const CATEGORIES = {
  rap: { label: 'RAP', color: '#ff006e', emoji: '🎤' },
  pop: { label: 'POP', color: '#00c8ff', emoji: '🌟' },
  klasyki: { label: 'KLASYKI', color: '#ffbe0b', emoji: '🏆' },
}

export const ATTEMPT_DURATIONS = [0.1, 0.5, 1, 3, 10]
export const ATTEMPT_MULTIPLIERS = [1.0, 0.8, 0.6, 0.4, 0.2]
export const BASE_POINTS = 100
export const TIME_BONUS_MAX = 50

export function calcPoints(attemptIndex, timeSeconds) {
  const multiplier = ATTEMPT_MULTIPLIERS[attemptIndex] || 0
  const timeBonus = Math.max(0, Math.floor((1 - timeSeconds / 15) * TIME_BONUS_MAX))
  return Math.round(BASE_POINTS * multiplier + timeBonus)
}

export function getRandomSongs(category, count = 5) {
  const pool = SONGS.filter(s => s.category === category)
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length))
}

export function normalizeTitle(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').trim()
}

export function checkGuess(input, song) {
  const normInput = normalizeTitle(input)
  const normTitle = normalizeTitle(song.title)
  const normArtist = normalizeTitle(song.artist)
  const titleMatch = normInput === normTitle || (normTitle.includes(normInput) && normInput.length > 3)
  const artistMatch = normArtist.split(' ').some(w => w.length > 3 && normInput.includes(w)) || normInput.includes(normArtist)
  if (titleMatch && artistMatch) return 'exact'
  if (titleMatch) return 'title_only'
  if (artistMatch) return 'artist_only'
  return 'wrong'
}

export function getAutocompleteSuggestions(input, songs) {
  if (!input || input.length < 2) return []
  const norm = normalizeTitle(input)
  return songs.filter(s => {
    const t = normalizeTitle(s.title)
    const a = normalizeTitle(s.artist)
    return t.startsWith(norm) || a.startsWith(norm) || t.includes(norm) || a.includes(norm)
  }).slice(0, 6)
}
