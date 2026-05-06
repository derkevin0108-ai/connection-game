import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket, getPlayerId, loadProfile } from '../lib/socket';
import type { Room, Category, Depth, GameSettings } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, DEPTH_LABELS } from '../lib/types';
import { sounds, isMuted, setMuted } from '../lib/sounds';

const ALL_CATEGORIES: Category[] = ['lustig', 'deepTalk', 'hotTakes', 'beziehungen', 'erinnerungen'];
const ALL_DEPTHS: Depth[] = ['leicht', 'persoenlich', 'intensiv'];
const ROUND_OPTIONS: (number | 'all')[] = [3, 5, 8, 'all'];

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');
  const [muted, setMutedState] = useState(isMuted());
  const playerId = getPlayerId();

  useEffect(() => {
    if (!code) return;
    const profile = loadProfile();
    function attemptJoin() {
      socket.emit(
        'room:join',
        { playerId, name: profile.name || 'Spieler', emoji: profile.emoji, code: code! },
        (res: { ok: true; room: Room } | { ok: false; error: string }) => {
          if (!res.ok) { alert(res.error); navigate('/'); return; }
          setRoom(res.room);
        }
      );
    }
    if (socket.connected) attemptJoin();
    else socket.once('connect', attemptJoin);
    socket.on('room:update', setRoom);
    return () => { socket.off('room:update', setRoom); };
  }, [code, playerId, navigate]);

  useEffect(() => {
    if (room && room.game.phase !== 'lobby') navigate(`/game/${code}`);
  }, [room, code, navigate]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    (async () => {
      try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
      } catch { /* */ }
    })();
    return () => { wakeLock?.release().catch(() => {}); };
  }, []);

  function handleCopy() {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleLeave() {
    socket.emit('room:leave', { playerId, code: code! });
    navigate('/');
  }

  function handleStart() {
    sounds.start();
    socket.emit('game:start', { code: code!, playerId });
  }

  function pushSettings(next: GameSettings) {
    socket.emit('lobby:updateSettings', { code: code!, playerId, settings: next });
  }

  function toggleCategory(c: Category) {
    if (!room || room.hostId !== playerId) return;
    const cur = room.game.settings.categories;
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c];
    if (next.length === 0) return;
    pushSettings({ ...room.game.settings, categories: next });
  }

  function toggleDepth(d: Depth) {
    if (!room || room.hostId !== playerId) return;
    const cur = room.game.settings.depths;
    const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
    if (next.length === 0) return;
    pushSettings({ ...room.game.settings, depths: next });
  }

  function setRounds(r: number | 'all') {
    if (!room || room.hostId !== playerId) return;
    pushSettings({ ...room.game.settings, totalRounds: r });
  }

  function handleAddCustom() {
    if (!customText.trim()) return;
    socket.emit('lobby:addCustomQuestion', { code: code!, playerId, text: customText });
    setCustomText('');
  }

  function handleRemoveCustom(qid: string) {
    socket.emit('lobby:removeCustomQuestion', { code: code!, playerId, questionId: qid });
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  if (!room) return <div className="text-slate-400 mt-20">Verbinde…</div>;

  const isHost = room.hostId === playerId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const settings = room.game.settings;
  const customCount = settings.customQuestions.length;
  const hasPersistentData = room.game.gamesPlayed > 0;

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <header className="flex items-center justify-between mt-4">
        <button onClick={handleLeave} className="text-slate-400 text-sm">← Verlassen</button>
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="text-slate-400 text-lg" aria-label="Mute">
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="text-slate-500 text-sm">{connectedCount} / {room.players.length} online</div>
        </div>
      </header>

      <div className="text-center">
        <p className="text-slate-400 text-sm mb-2">Raum-Code</p>
        <div className="text-6xl font-bold tracking-widest">{room.code}</div>
        {hasPersistentData && (
          <p className="text-xs text-amber-300/80 mt-3">
            🕸️ Connection-Daten aus {room.game.gamesPlayed} bisherigen Spiel{room.game.gamesPlayed > 1 ? 'en' : ''} bleiben erhalten
          </p>
        )}
      </div>

      <button onClick={handleCopy} className="bg-slate-800 hover:bg-slate-700 rounded-lg py-3 font-medium">
        {copied ? '✓ Link kopiert' : '🔗 Einladungs-Link kopieren'}
      </button>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-slate-400 uppercase tracking-wide">Spieler</h2>
        <div className="flex flex-col gap-2">
          {room.players.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-3 ${!p.connected ? 'opacity-40' : ''}`}>
              <span className="text-2xl">{p.emoji}</span>
              <span className="font-medium flex-1">{p.name}</span>
              {p.isHost && <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded">HOST</span>}
              {!p.connected && <span className="text-xs text-slate-500">offline</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Kategorien */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-slate-400 uppercase tracking-wide">
          Kategorien {!isHost && '(Host wählt)'}
        </h2>
        <div className="flex flex-col gap-2">
          {ALL_CATEGORIES.map((c) => {
            const active = settings.categories.includes(c);
            return (
              <button key={c} onClick={() => toggleCategory(c)} disabled={!isHost}
                className={`text-left rounded-lg px-4 py-3 border-2 transition-colors ${
                  active ? 'bg-indigo-500/20 border-indigo-400' : 'bg-slate-800 border-slate-700'
                } ${!isHost && 'opacity-70 cursor-not-allowed'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                    active ? 'bg-indigo-400 border-indigo-400' : 'border-slate-600'
                  }`}>{active && '✓'}</div>
                  <div className="flex-1">
                    <div className="font-medium">{CATEGORY_LABELS[c]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{CATEGORY_DESCRIPTIONS[c]}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiefe */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-slate-400 uppercase tracking-wide">
          Tiefe {!isHost && '(Host wählt)'}
        </h2>
        <div className="flex flex-col gap-2">
          {ALL_DEPTHS.map((d) => {
            const active = settings.depths.includes(d);
            const meta = DEPTH_LABELS[d];
            return (
              <button key={d} onClick={() => toggleDepth(d)} disabled={!isHost}
                className={`text-left rounded-lg px-4 py-3 border-2 transition-colors ${
                  active ? 'bg-indigo-500/20 border-indigo-400' : 'bg-slate-800 border-slate-700'
                } ${!isHost && 'opacity-70 cursor-not-allowed'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                    active ? 'bg-indigo-400 border-indigo-400' : 'border-slate-600'
                  }`}>{active && '✓'}</div>
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{meta.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{meta.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anzahl Runden */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-slate-400 uppercase tracking-wide">
          Anzahl Runden {!isHost && '(Host wählt)'}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {ROUND_OPTIONS.map((r) => {
            const active = settings.totalRounds === r;
            return (
              <button key={String(r)} onClick={() => setRounds(r)} disabled={!isHost}
                className={`rounded-lg py-3 font-medium ${
                  active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                } ${!isHost && 'opacity-70 cursor-not-allowed'}`}>
                {r === 'all' ? 'Alle' : r}
              </button>
            );
          })}
        </div>
        {settings.totalRounds === 'all' && (
          <p className="text-xs text-slate-500">Jeder ist einmal Rater ({connectedCount} Runden)</p>
        )}
      </div>

      {/* Custom Questions */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-slate-400 uppercase tracking-wide">
          Eigene Fragen ({customCount})
        </h2>
        <p className="text-xs text-slate-500 -mt-1">Insider-Witze, persönliche Fragen für eure Gruppe.</p>

        {settings.customQuestions.length > 0 && (
          <div className="flex flex-col gap-2 mb-1">
            {settings.customQuestions.map((q) => {
              const author = room.players.find((p) => p.id === q.authorId);
              const canDelete = isHost || q.authorId === playerId;
              return (
                <div key={q.id} className="flex items-start gap-2 bg-slate-800/50 rounded-lg px-3 py-2 text-sm">
                  <div className="flex-1">
                    <div className="text-slate-200">{q.text}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      von {author?.emoji} {author?.name || 'Unbekannt'}
                    </div>
                  </div>
                  {canDelete && (
                    <button onClick={() => handleRemoveCustom(q.id)} className="text-slate-500 hover:text-rose-400 text-lg px-1">×</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(); }}
            placeholder="Eigene Frage…"
            maxLength={200}
            className="bg-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-indigo-500 text-sm flex-1"
          />
          <button onClick={handleAddCustom} disabled={!customText.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg px-4 font-medium text-sm">
            +
          </button>
        </div>
      </div>

      <div className="mt-2">
        {isHost ? (
          <button disabled={connectedCount < 3} onClick={handleStart}
            className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg py-4 font-semibold text-lg">
            {connectedCount < 3
              ? `Mindestens 3 Spieler (${connectedCount}/3)`
              : (hasPersistentData ? 'Weiter spielen' : 'Spiel starten')}
          </button>
        ) : (
          <div className="text-center text-slate-400 py-4">Warte auf Host…</div>
        )}
      </div>
    </div>
  );
}
