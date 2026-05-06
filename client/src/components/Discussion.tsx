import { socket } from '../lib/socket';
import type { Room } from '../lib/types';

type Props = { room: Room; playerId: string };

export default function Discussion({ room, playerId }: Props) {
  const round = room.game.round;
  if (!round) return null;

  const isHost = room.hostId === playerId;
  const isLastRound = room.game.roundIndex + 1 >= room.game.totalRounds;
  const ready = round.readyForNext || [];
  const meReady = ready.includes(playerId);
  const connected = room.players.filter((p) => p.connected);
  const allReadyCount = ready.filter((id) => connected.some((p) => p.id === id)).length;
  const total = connected.length;

  function handleReady() {
    socket.emit('game:readyForNext', { code: room.code, playerId });
  }

  function handleHostNext() {
    socket.emit('game:nextRound', { code: room.code, playerId });
  }

  // Punktestand
  const sortedPlayers = [...room.players].sort(
    (a, b) => (room.game.scores[b.id] || 0) - (room.game.scores[a.id] || 0)
  );

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <div className="text-center text-slate-400 text-sm">
        Runde {round.number} von {room.game.totalRounds}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-400 uppercase mb-1">Frage</p>
        <p className="text-base font-medium leading-snug">{round.questionText}</p>
      </div>

      {/* Diskussions-Hinweis */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 text-center">
        <div className="text-3xl mb-2">💬</div>
        <h2 className="text-lg font-semibold mb-2">Zeit zum Quatschen</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Sprecht über die Antworten. Wer hat überrascht? Welche Antwort war zu offensichtlich?
          Wenn ihr fertig seid, drückt unten „Bereit".
        </p>
      </div>

      {/* Antworten-Übersicht zum Mitlesen */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-slate-500 uppercase tracking-wide">Antworten</h3>
        {round.answers.map((a) => {
          const player = room.players.find((p) => p.id === a.playerId);
          const guessedId = round.mappings[a.id];
          const isCorrect = guessedId === a.playerId;
          return (
            <div key={a.id} className={`rounded-lg p-3 border ${
              isCorrect ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'
            }`}>
              <div className="text-sm mb-1">{a.text}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span>{player?.emoji}</span>
                <span>{player?.name}</span>
                <span className="ml-auto">{isCorrect ? '✓' : '✕'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Punktestand */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-xs text-slate-400 uppercase mb-2 text-center">Punktestand</h3>
        <div className="flex flex-col gap-1">
          {sortedPlayers.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{p.emoji}</span>
              <span className="flex-1">{p.name}</span>
              <span className="font-bold tabular-nums">{room.game.scores[p.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bereit-Button */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleReady}
          disabled={meReady}
          className={`rounded-lg py-4 font-semibold text-lg ${
            meReady
              ? 'bg-emerald-700/40 text-emerald-200 cursor-default'
              : 'bg-indigo-500 hover:bg-indigo-400'
          }`}
        >
          {meReady ? `✓ Bereit (${allReadyCount}/${total})` : `Bereit für ${isLastRound ? 'Endergebnis' : 'nächste Runde'} (${allReadyCount}/${total})`}
        </button>

        {isHost && allReadyCount < total && (
          <button onClick={handleHostNext} className="text-slate-400 text-sm py-2 hover:text-slate-200">
            Als Host weiter → ohne auf alle zu warten
          </button>
        )}
      </div>

      {/* Bereit-Status der Spieler */}
      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {connected.map((p) => {
          const isReady = ready.includes(p.id);
          return (
            <span key={p.id} className={`px-2 py-1 rounded ${
              isReady ? 'bg-emerald-600/30 text-emerald-200' : 'bg-slate-800 text-slate-500'
            }`}>
              {isReady ? '✓ ' : ''}{p.emoji} {p.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
