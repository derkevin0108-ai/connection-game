import { useState } from 'react';
import { socket } from '../lib/socket';
import type { Room } from '../lib/types';

type Props = { room: Room; playerId: string };

export default function Matching({ room, playerId }: Props) {
  const round = room.game.round;
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  if (!round) return null;
  const isRater = round.raterId === playerId;

  if (!isRater) {
    const rater = room.players.find((p) => p.id === round.raterId);
    return (
      <div className="w-full max-w-md flex flex-col gap-6 text-center mt-10">
        <div className="text-6xl">{rater?.emoji}</div>
        <h2 className="text-xl font-medium">{rater?.name} ordnet zu…</h2>
        <p className="text-slate-400">
          Gleich wird aufgedeckt, wer was geschrieben hat.
        </p>
        <div className="bg-slate-800 rounded-xl p-5 mt-4">
          <p className="text-xs text-slate-400 uppercase mb-2">Frage</p>
          <p className="text-base">{round.questionText}</p>
        </div>
      </div>
    );
  }

  // Rater-View
  const answerers = room.players.filter((p) => p.id !== round.raterId);
  const assignedPlayerIds = new Set(Object.values(mappings));
  const allAssigned = round.answers.every((a) => mappings[a.id]);

  function handleAnswerTap(answerId: string) {
    setSelectedAnswerId((prev) => (prev === answerId ? null : answerId));
  }

  function handlePlayerTap(targetPlayerId: string) {
    if (!selectedAnswerId) return;
    setMappings((prev) => {
      const next = { ...prev };
      // Falls dieser Spieler woanders zugewiesen war, dort entfernen
      for (const [aid, pid] of Object.entries(next)) {
        if (pid === targetPlayerId) delete next[aid];
      }
      next[selectedAnswerId] = targetPlayerId;
      return next;
    });
    setSelectedAnswerId(null);
  }

  function handleClear(answerId: string) {
    setMappings((prev) => {
      const next = { ...prev };
      delete next[answerId];
      return next;
    });
  }

  function handleConfirm() {
    socket.emit('game:submitMappings', { code: room.code, playerId, mappings });
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <div className="text-center text-slate-400 text-sm">
        Runde {round.number} von {room.game.totalRounds}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-400 uppercase mb-1">Frage</p>
        <p className="text-base font-medium leading-snug">{round.questionText}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-slate-500 uppercase tracking-wide">
          Antworten — wähle eine aus
        </h3>
        {round.answers.map((a) => {
          const assignedPlayerId = mappings[a.id];
          const assignedPlayer = assignedPlayerId
            ? room.players.find((p) => p.id === assignedPlayerId)
            : null;
          const isSelected = selectedAnswerId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => handleAnswerTap(a.id)}
              className={`text-left rounded-lg px-4 py-3 border-2 transition-colors ${
                isSelected
                  ? 'bg-indigo-500/30 border-indigo-400'
                  : assignedPlayer
                  ? 'bg-slate-800 border-emerald-600/50'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm">{a.text}</div>
                {assignedPlayer ? (
                  <div
                    className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-200 px-2 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(a.id);
                    }}
                  >
                    {assignedPlayer.emoji} {assignedPlayer.name} ✕
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">?</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-slate-500 uppercase tracking-wide">
          {selectedAnswerId ? 'Wer hat das geschrieben?' : 'Spieler'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {answerers.map((p) => {
            const isAssigned = assignedPlayerIds.has(p.id);
            const disabled = !selectedAnswerId || isAssigned;
            return (
              <button
                key={p.id}
                onClick={() => handlePlayerTap(p.id)}
                disabled={disabled}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 ${
                  isAssigned
                    ? 'bg-slate-800/30 opacity-40'
                    : selectedAnswerId
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-800/50'
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-sm flex-1 text-left">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!allAssigned}
        className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg py-4 font-semibold text-lg mt-2"
      >
        {allAssigned ? 'Bestätigen & auflösen' : `Noch ${round.answers.length - Object.keys(mappings).length} zuordnen`}
      </button>
    </div>
  );
}
