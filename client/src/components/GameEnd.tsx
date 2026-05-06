import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import type { Room } from '../lib/types';
import ConnectionNetwork from './ConnectionNetwork';
import { computeAchievements } from '../lib/achievements';
import { sounds } from '../lib/sounds';

type Props = { room: Room; playerId: string };

export default function GameEnd({ room, playerId }: Props) {
  const isHost = room.hostId === playerId;
  const ranked = [...room.players].sort(
    (a, b) => (room.game.scores[b.id] || 0) - (room.game.scores[a.id] || 0)
  );
  const achievements = computeAchievements(room.players, room.game.connections);

  // Beim Mounten: Endscreen-Sound
  useEffect(() => { sounds.end(); }, []);

  // Achievements gestaffelt einblenden, jedes mit Sound
  const [shownAchievements, setShownAchievements] = useState(0);
  useEffect(() => {
    if (achievements.length === 0) return;
    setShownAchievements(0);
    const reveal = (i: number) => {
      if (i >= achievements.length) return;
      const t = setTimeout(() => {
        sounds.achievement();
        setShownAchievements(i + 1);
        reveal(i + 1);
      }, i === 0 ? 2200 : 1100);
      return t;
    };
    const t = reveal(0);
    return () => { if (t) clearTimeout(t); };
  }, [achievements.length]);

  function handleReset() {
    socket.emit('game:reset', { code: room.code, playerId });
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <style>{`
        @keyframes achievementSlide {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          60% { transform: translateY(-4px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      <div className="text-center mt-4">
        <p className="text-slate-400 text-sm">Spiel beendet</p>
        <h1 className="text-3xl font-bold mt-2">Connection-Netzwerk</h1>
        <p className="text-slate-400 text-sm mt-2">
          Wer hat sich gegenseitig am besten verstanden?
        </p>
      </div>

      <ConnectionNetwork players={room.players} connections={room.game.connections} />

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-slate-400 uppercase tracking-wide text-center">
            Auszeichnungen
          </h3>
          {achievements.slice(0, shownAchievements).map((a) => {
            const players = a.playerIds
              .map((id) => room.players.find((p) => p.id === id))
              .filter((p): p is NonNullable<typeof p> => !!p);
            return (
              <div
                key={a.key}
                className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/40 rounded-xl p-4"
                style={{ animation: 'achievementSlide 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{a.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-indigo-100">{a.title}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{a.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {players.map((p) => (
                        <span key={p.id} className="text-sm bg-slate-800/60 rounded px-2 py-1">
                          {p.emoji} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Punktestand */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3 text-center">Punktestand</h3>
        <div className="flex flex-col gap-2">
          {ranked.map((p, idx) => {
            const score = room.game.scores[p.id] || 0;
            const isWinner = idx === 0;
            return (
              <div key={p.id} className={`flex items-center gap-3 ${isWinner ? 'text-amber-200' : ''}`}>
                <span className="text-slate-500 w-6 text-right">{idx + 1}.</span>
                <span className="text-xl">{p.emoji}</span>
                <span className="flex-1">{p.name}</span>
                {isWinner && <span>👑</span>}
                <span className="font-bold tabular-nums">{score}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isHost ? (
        <button onClick={handleReset}
          className="bg-indigo-500 hover:bg-indigo-400 rounded-lg py-4 font-semibold text-lg">
          Nochmal spielen
        </button>
      ) : (
        <div className="text-center text-slate-400 py-4">Warte auf Host…</div>
      )}
    </div>
  );
}
