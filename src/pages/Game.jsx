import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getRoom, joinRoom, recordRoundResult } from '../services/room';
import {
  ATTEMPT_DURATIONS,
  ATTEMPT_MULTIPLIERS,
  calcPoints,
  CATEGORIES,
  checkGuess,
  getAutocompleteSuggestions,
} from '../data/songs';
import { supabase } from '../supabase';

const ANSWER_TIME = 15;

export default function Game({ user }) {
  const { code, playerName } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [phase, setPhase] = useState('waiting');
  const [attempt, setAttempt] = useState(0);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [guessResult, setGuessResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME);
  const [roundPoints, setRoundPoints] = useState(null);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [myTurnDone, setMyTurnDone] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const phaseRef = useRef(phase);
  const attemptRef = useRef(attempt);
  phaseRef.current = phase;
  attemptRef.current = attempt;

  const currentSong = room ? room.songs[room.current_round] : null;
  const cat = room ? CATEGORIES[room.category] : null;

  useEffect(() => {
    const init = async () => {
      let r = await getRoom(code);
      if (!r) {
        navigate('/');
        return;
      }
      if (role === 'guest' && !r.guest_name) {
        try {
          r = await joinRoom(code, playerName);
        } catch {
          navigate('/');
          return;
        }
      }
      setRoom(r);
    };
    init();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          const newRoom = payload.new;
          setRoom((prev) => {
            if (prev && newRoom.current_round > prev.current_round) {
              setMyTurnDone(false);
              setAttempt(0);
              setInput('');
              setSuggestions([]);
              setGuessResult(null);
              setRoundPoints(null);
              setPhase('listening');
              setTimeout(() => playSnippet(0, newRoom), 500);
            }
            if (newRoom.status === 'finished') {
              setTimeout(() => navigate(`/results/${code}`), 2000);
            }
            return newRoom;
          });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [code]);

  const playSnippet = useCallback(
    (attemptIndex, roomData) => {
      const song = roomData
        ? roomData.songs[roomData.current_round]
        : currentSong;
      if (!song?.previewUrl) {
        setAudioError(true);
        startAnswerPhase();
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = song.previewUrl;
      audio.currentTime = 10;
      audio.volume = 0.8;
      setIsPlaying(true);
      setAudioError(false);
      audio
        .play()
        .then(() => {
          setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
            startAnswerPhase();
          }, ATTEMPT_DURATIONS[attemptIndex] * 1000);
        })
        .catch(() => {
          setAudioError(true);
          setIsPlaying(false);
          startAnswerPhase();
        });
    },
    [currentSong]
  );

  const startAnswerPhase = () => {
    setPhase('answering');
    setAnswerStartTime(Date.now());
    setTimeLeft(ANSWER_TIME);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = useCallback(() => {
    clearInterval(timerRef.current);
    const curAttempt = attemptRef.current;
    if (curAttempt < ATTEMPT_DURATIONS.length - 1) {
      const next = curAttempt + 1;
      setAttempt(next);
      setInput('');
      setSuggestions([]);
      setGuessResult(null);
      setPhase('listening');
      setTimeout(() => playSnippet(next), 500);
    } else {
      submitResult(0, curAttempt, ANSWER_TIME, false);
    }
  }, [playSnippet]);

  const handleGuess = () => {
    if (!input.trim() || phaseRef.current !== 'answering') return;
    clearInterval(timerRef.current);
    const timeSpent = (Date.now() - answerStartTime) / 1000;
    const result = checkGuess(input, currentSong);
    setGuessResult(result);

    if (result === 'exact') {
      const pts = calcPoints(attemptRef.current, timeSpent);
      setRoundPoints(pts);
      submitResult(pts, attemptRef.current, timeSpent, true);
    } else if (result === 'title_only' || result === 'artist_only') {
      setTimeLeft(ANSWER_TIME);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      const curAttempt = attemptRef.current;
      if (curAttempt < ATTEMPT_DURATIONS.length - 1) {
        const next = curAttempt + 1;
        setTimeout(() => {
          setAttempt(next);
          setInput('');
          setSuggestions([]);
          setGuessResult(null);
          setPhase('listening');
          playSnippet(next);
        }, 600);
      } else {
        submitResult(0, curAttempt, timeSpent, false);
      }
    }
  };

  const submitResult = async (pts, attemptIndex, timeSeconds, guessed) => {
    setMyTurnDone(true);
    setPhase('waiting_opponent');
    setRoundPoints(pts);
    const updated = await recordRoundResult(
      code,
      playerName,
      pts,
      attemptIndex,
      timeSeconds,
      guessed
    );
    if (updated) setRoom(updated);
  };

  useEffect(() => {
    if (room && room.status === 'playing' && phase === 'waiting') {
      setPhase('listening');
      setTimeout(() => playSnippet(0), 800);
    }
  }, [room?.status]);

  const handleInputChange = (val) => {
    setInput(val);
    setGuessResult(null);
    if (room) setSuggestions(getAutocompleteSuggestions(val, room.songs));
  };

  if (!room) return <Loader />;

  const scores = room.scores || {};
  const opponent =
    playerName === room.host_name ? room.guest_name : room.host_name;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <audio ref={audioRef} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'DM Mono',
              fontSize: 12,
              color: '#8888aa',
              marginBottom: 4,
            }}
          >
            KOD POKOJU
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 32,
              letterSpacing: 4,
              color: cat?.color,
            }}
          >
            {code}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'DM Mono',
              fontSize: 12,
              color: '#8888aa',
              marginBottom: 4,
            }}
          >
            RUNDA
          </div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 32 }}>
            {room.current_round + 1}
            <span style={{ color: '#8888aa' }}>/{room.total_rounds}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'DM Mono',
              fontSize: 12,
              color: '#8888aa',
              marginBottom: 4,
            }}
          >
            KATEGORIA
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 20,
              color: cat?.color,
            }}
          >
            {cat?.emoji} {cat?.label}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[playerName, opponent].filter(Boolean).map((name, i) => (
          <div
            key={name}
            className="card"
            style={{
              padding: '16px 20px',
              textAlign: i === 0 ? 'left' : 'right',
              borderColor: i === 0 ? '#00ff87' : '#2a2a3a',
              background: i === 0 ? 'rgba(0,255,135,0.05)' : '#15151f',
            }}
          >
            <div
              style={{
                fontFamily: 'DM Mono',
                fontSize: 12,
                color: '#8888aa',
                marginBottom: 4,
              }}
            >
              {i === 0 ? '👤 TY' : '🎮 PRZECIWNIK'}
            </div>
            <div
              style={{
                fontFamily: 'DM Mono',
                fontSize: 13,
                marginBottom: 8,
                color: i === 0 ? '#00ff87' : '#f0f0ff',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: 36,
                color: i === 0 ? '#00ff87' : '#f0f0ff',
              }}
            >
              {scores[name] || 0}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          justifyContent: 'center',
        }}
      >
        {ATTEMPT_DURATIONS.map((dur, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background:
                i < attempt ? '#ff006e' : i === attempt ? '#00ff87' : '#1a1a24',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: 'DM Mono',
          fontSize: 11,
          color: '#8888aa',
          textAlign: 'center',
          marginBottom: 28,
        }}
      >
        PRÓBA {attempt + 1}/5 · {ATTEMPT_DURATIONS[attempt]}s · ×
        {ATTEMPT_MULTIPLIERS[attempt]}
      </div>

      <div
        className="card"
        style={{
          padding: 32,
          textAlign: 'center',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {phase === 'listening' && (
          <div className="fade-in">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '3px solid #00ff87',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: isPlaying
                  ? 'pulse-glow 1s ease-in-out infinite'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 32 }}>{isPlaying ? '🎵' : '⏳'}</span>
            </div>
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: 24,
                letterSpacing: 2,
                color: '#8888aa',
              }}
            >
              {isPlaying ? 'SŁUCHAJ...' : 'PRZYGOTUJ SIĘ...'}
            </div>
            {audioError && (
              <div
                style={{
                  color: '#ff006e',
                  fontSize: 13,
                  marginTop: 12,
                  fontFamily: 'DM Mono',
                }}
              >
                ⚠ Brak preview — zgaduj po nazwie!
              </div>
            )}
          </div>
        )}

        {phase === 'answering' && (
          <div className="fade-in" style={{ width: '100%' }}>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 48,
                  color: timeLeft <= 5 ? '#ff006e' : '#00ff87',
                }}
              >
                {timeLeft}
              </div>
              <div
                style={{
                  height: 4,
                  background: '#1a1a24',
                  borderRadius: 2,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    background: timeLeft <= 5 ? '#ff006e' : '#00ff87',
                    width: `${(timeLeft / ANSWER_TIME) * 100}%`,
                    transition: 'width 1s linear',
                  }}
                />
              </div>
            </div>
            {guessResult === 'title_only' && (
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,190,11,0.15)',
                  border: '1px solid rgba(255,190,11,0.4)',
                  borderRadius: 6,
                  color: '#ffbe0b',
                  fontSize: 13,
                  fontFamily: 'DM Mono',
                  marginBottom: 12,
                }}
              >
                🟡 Dobry tytuł! Dodaj artystę
              </div>
            )}
            {guessResult === 'artist_only' && (
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,190,11,0.15)',
                  border: '1px solid rgba(255,190,11,0.4)',
                  borderRadius: 6,
                  color: '#ffbe0b',
                  fontSize: 13,
                  fontFamily: 'DM Mono',
                  marginBottom: 12,
                }}
              >
                🟡 Dobry artysta! Wpisz tytuł
              </div>
            )}
            {guessResult === 'wrong' && (
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,0,110,0.1)',
                  border: '1px solid rgba(255,0,110,0.3)',
                  borderRadius: 6,
                  color: '#ff006e',
                  fontSize: 13,
                  fontFamily: 'DM Mono',
                  marginBottom: 12,
                  animation: 'shake 0.4s ease',
                }}
              >
                ❌ Nie to!
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                placeholder="Wpisz tytuł lub artystę..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                autoFocus
                style={{ fontSize: 16, padding: '14px 16px' }}
              />
              {suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#111118',
                    border: '1px solid #2a2a3a',
                    borderRadius: '0 0 8px 8px',
                    zIndex: 10,
                  }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setInput(`${s.title} ${s.artist}`);
                        setSuggestions([]);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f0f0ff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'DM Mono',
                        fontSize: 13,
                        borderBottom:
                          i < suggestions.length - 1
                            ? '1px solid #2a2a3a'
                            : 'none',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#1a1a24')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <span>{s.title}</span>
                      <span style={{ color: '#8888aa' }}>{s.artist}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%', fontSize: 15 }}
              onClick={handleGuess}
            >
              → ZGADNIJ
            </button>
          </div>
        )}

        {phase === 'waiting_opponent' && (
          <div className="fade-in">
            {roundPoints !== null && (
              <div
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 64,
                  color: roundPoints > 0 ? '#00ff87' : '#ff006e',
                  marginBottom: 8,
                }}
              >
                {roundPoints > 0 ? `+${roundPoints}` : '0'}
              </div>
            )}
            <div
              style={{ fontFamily: 'DM Mono', color: '#8888aa', fontSize: 14 }}
            >
              ⏳ Czekam na przeciwnika...
            </div>
          </div>
        )}
      </div>

      {!room.guest_name && (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 16,
            borderColor: 'rgba(255,190,11,0.3)',
          }}
        >
          <div
            style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#ffbe0b' }}
          >
            ⚠ Czekaj aż znajomy dołączy z kodem <strong>{code}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid #00ff87',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}
