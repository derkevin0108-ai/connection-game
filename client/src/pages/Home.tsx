import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket, getPlayerId, saveProfile, loadProfile } from '../lib/socket';
import type { Room } from '../lib/types';
import Tutorial from '../components/Tutorial';

const EMOJIS = ['🦊', '🐻', '🐼', '🐨', '🦁', '🐸', '🐙', '🦄', '🐵', '🦉', '🐝', '🦖'];

function tutorialSeen(): boolean {
  try { return localStorage.getItem('connection.tutorialSeen') === '1'; } catch { return false; }
}

export default function Home() {
  const navigate = useNavigate();
  const { code: codeFromUrl } = useParams();

  const profile = loadProfile();
  const [name, setName] = useState(profile.name);
  const [emoji, setEmoji] = useState(profile.emoji);
  const [code, setCode] = useState(codeFromUrl?.toUpperCase() || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(!tutorialSeen());

  useEffect(() => {
    if (codeFromUrl) setCode(codeFromUrl.toUpperCase());
  }, [codeFromUrl]);

  function handleCreate() {
    if (!name.trim()) return setError('Bitte einen Namen eingeben.');
    setBusy(true); setError(null);
    saveProfile(name, emoji);
    socket.emit(
      'room:create',
      { playerId: getPlayerId(), name, emoji },
      (res: { ok: true; room: Room } | { ok: false; error: string }) => {
        setBusy(false);
        if (!res.ok) return setError(res.error);
        navigate(`/room/${res.room.code}`);
      }
    );
  }

  function handleJoin() {
    if (!name.trim()) return setError('Bitte einen Namen eingeben.');
    if (!code.trim()) return setError('Bitte einen Raum-Code eingeben.');
    setBusy(true); setError(null);
    saveProfile(name, emoji);
    socket.emit(
      'room:join',
      { playerId: getPlayerId(), name, emoji, code: code.toUpperCase() },
      (res: { ok: true; room: Room } | { ok: false; error: string }) => {
        setBusy(false);
        if (!res.ok) return setError(res.error);
        navigate(`/room/${res.room.code}`);
      }
    );
  }

  return (
    <>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="text-center mt-8 relative">
          <h1 className="text-4xl font-bold tracking-tight">Connection</h1>
          <p className="text-slate-400 mt-2">Wer kennt wen am besten?</p>
          <button
            onClick={() => setShowTutorial(true)}
            className="absolute right-0 top-0 text-slate-500 hover:text-slate-300 text-sm"
            aria-label="Tutorial"
          >
            ?
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-400">Dein Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Kevin" maxLength={20}
            className="bg-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-indigo-500" />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-400">Dein Emoji</label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`text-2xl py-2 rounded-lg ${emoji === e ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {codeFromUrl ? (
            <button disabled={busy} onClick={handleJoin}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-lg py-4 font-semibold text-lg">
              Raum {codeFromUrl.toUpperCase()} beitreten
            </button>
          ) : (
            <>
              <button disabled={busy} onClick={handleCreate}
                className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-lg py-4 font-semibold text-lg">
                Raum erstellen
              </button>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-sm">oder</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Raum-Code (4 Zeichen)" maxLength={4}
                className="bg-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-indigo-500 text-center text-2xl tracking-widest uppercase" />
              <button disabled={busy} onClick={handleJoin}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg py-4 font-semibold">
                Raum beitreten
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
