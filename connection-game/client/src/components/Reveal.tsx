import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import type { Room } from '../lib/types';

type Props = { room: Room; playerId: string };

const REVEAL_DELAY_MS = 2500;

export default function Reveal({ room, playerId }: Props) {
  const round = room.game.round;
  const [revealStep, setRevealStep] = useState(0);
  const isHost = room.hostId === playerId;
  const isLastRound = room.game.roundIndex + 1 >= room.game.totalRounds;

  // Animation: alle 2.5s eine Antwort aufdecken
  useEffect(() => {
    if (!round) return;
    if (revealStep >= round.answers.length) return;
    const t = setTimeout(() => setRevealStep((s) => s + 1), REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [revealStep, round]);

  if (!round) return null;

  const allRevealed = revealStep >= round.answers.length;
  const rater = room.players.find((p) => p.id === round.raterId);

  function handleNext() {
    socket.emit('game:nextRound', { code: room.code, playerId });
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

      <div className="flex flex-col gap-3">
        {round.answers.map((answer, idx) => {
          const revealed = idx < revealStep;
          const guessedId = round.mappings[answer.id];
          const actualPlayer = room.players.find((p) => p.id === answer.playerId);
          const guessedPlayer = room.players.find((p) => p.id === guessedId);
          const isCorrect = guessedId === answer.playerId;

          return (
            <div
              key={answer.id}
              className={`rounded-lg p-4 border-2 transition-all ${
                !revealed
                  ? 'bg-slate-800 border-slate-700'
                  : isCorrect
                  ? 'bg-emerald-900/30 border-emerald-500/60'
                  : 'bg-rose-900/30 border-rose-500/60'
              }`}
            >
              <div className="text-sm mb-3">{answer.text}</div>
              {revealed ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">{rater?.name} tippte:</span>
                  <span>
                    {guessedPlayer?.emoji} {guessedPlayer?.name}
                  </span>
                  <span className="mx-1 text-slate-500">→</span>
                  <span className="text-slate-400">tatsächlich:</span>
                  <span>
                    {actualPlayer?.emoji} {actualPlayer?.name}
                  </span>
                  <span className="ml-auto text-lg">{isCorrect ? '✓' : '✕'}</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">…wird aufgedeckt</div>
              )}
            </div>
          );
        })}
      </div>

      {allRevealed && (
        <>
          <div className="bg-slate-800/50 rounded-xl p-4 mt-2">
            <h3 className="text-xs text-slate-400 uppercase mb-3 text-center">
              Punktestand
            </h3>
            <div className="flex flex-col gap-2">
              {[...room.players]
                .sort(
                  (a, b) =>
                    (room.game.scores[b.id] || 0) - (room.game.scores[a.id] || 0)
                )
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="flex-1">{p.name}</span>
                    <span className="font-bold tabular-nums">
                      {room.game.scores[p.id] || 0}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={handleNext}
              className="bg-indigo-500 hover:bg-indigo-400 rounded-lg py-4 font-semibold text-lg"
            >
              {isLastRound ? 'Endergebnis anzeigen' : 'Nächste Runde'}
            </button>
          ) : (
            <div className="text-center text-slate-400 py-4">
              Warte auf Host…
            </div>
          )}
        </>
      )}
    </div>
  );
}
