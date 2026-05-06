import { socket } from '../lib/socket';
import type { Room } from '../lib/types';
import ConnectionNetwork from './ConnectionNetwork';

type Props = { room: Room; playerId: string };

export default function GameEnd({ room, playerId }: Props) {
  const isHost = room.hostId === playerId;

  const ranked = [...room.players].sort(
    (a, b) => (room.game.scores[b.id] || 0) - (room.game.scores[a.id] || 0)
  );

  function handleReset() {
    socket.emit('game:reset', { code: room.code, playerId });
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="text-center mt-4">
        <p className="text-slate-400 text-sm">Spiel beendet</p>
        <h1 className="text-3xl font-bold mt-2">Connection-Netzwerk</h1>
        <p className="text-slate-400 text-sm mt-2">
          Wer hat sich gegenseitig am besten verstanden?
        </p>
      </div>

      <ConnectionNetwork
        players={room.players}
        connections={room.game.connections}
      />

      <div className="bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3 text-center">
          Punktestand
        </h3>
        <div className="flex flex-col gap-2">
          {ranked.map((p, idx) => {
            const score = room.game.scores[p.id] || 0;
            const isWinner = idx === 0;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 ${
                  isWinner ? 'text-amber-200' : ''
                }`}
              >
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
        <button
          onClick={handleReset}
          className="bg-indigo-500 hover:bg-indigo-400 rounded-lg py-4 font-semibold text-lg"
        >
          Nochmal spielen
        </button>
      ) : (
        <div className="text-center text-slate-400 py-4">Warte auf Host…</div>
      )}
    </div>
  );
}
