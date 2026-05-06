import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import type { Room } from '../lib/types';
import { sounds } from '../lib/sounds';
import Confetti from './Confetti';

type Props = { room: Room; playerId: string };

const REVEAL_DELAY_MS = 2200;

export default function Reveal({ room, playerId }: Props) {
  const round = room.game.round;
  const [revealStep, setRevealStep] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Reveal-Animation: jede Antwort einzeln aufdecken
  useEffect(() => {
    if (!round) return;
    if (revealStep >= round.answers.length) return;
    const t = setTimeout(() => {
      const next = revealStep + 1;
      const justRevealed = round.answers[revealStep];
      const isCorrect =
        justRevealed && round.mappings[justRevealed.id] === justRevealed.playerId;
      if (isCorrect) {
        sounds.correct();
        setConfettiTrigger((c) => c + 1);
      } else {
        sounds.wrong();
      }
      setRevealStep(next);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [revealStep, round]);

  // Wenn alle aufgedeckt: in die Discussion-Phase wechseln (nur einmal pro Runde, nicht pro Spieler)
  useEffect(() => {
    if (!round) return;
    if (revealStep >= round.answers.length && room.game.phase === 'reveal') {
      // Kleiner Buffer, damit der letzte Sound/Effekt noch läuft
      const t = setTimeout(() => {
        socket.emit('game:revealDone', { code: room.code, playerId });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [revealStep, round, room.game.phase, room.code, playerId]);

  if (!round) return null;
  const rater = room.players.find((p) => p.id === round.raterId);

  return (
    <div className="w-full max-w-md flex flex-col gap-5 relative">
      <Confetti trigger={confettiTrigger} />

      <div className="text-center text-slate-400 text-sm">
        Runde {round.number} von {room.game.totalRounds}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-400 uppercase mb-1">Frage</p>
        <p className="text-base font-medium leading-snug">{round.questionText}</p>
      </div>

      <div className="text-center text-sm text-slate-400">
        <span className="text-xl mr-1">{rater?.emoji}</span>
        {rater?.name} hat geraten
      </div>

      <div className="flex flex-col gap-3">
        {round.answers.map((answer, idx) => {
          const revealed = idx < revealStep;
          const guessedId = round.mappings[answer.id];
          const actualPlayer = room.players.find((p) => p.id === answer.playerId);
          const guessedPlayer = room.players.find((p) => p.id === guessedId);
          const isCorrect = guessedId === answer.playerId;
          return (
            <div key={answer.id}
              style={{
                transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: revealed ? 'scale(1)' : 'scale(0.97)',
              }}
              className={`rounded-lg p-4 border-2 ${
                !revealed ? 'bg-slate-800 border-slate-700'
                  : isCorrect ? 'bg-emerald-900/30 border-emerald-500/60'
                  : 'bg-rose-900/30 border-rose-500/60'
              }`}>
              <div className="text-sm mb-3">{answer.text}</div>
              {revealed ? (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="text-slate-400 text-xs">Tipp:</span>
                  <span>{guessedPlayer?.emoji} {guessedPlayer?.name}</span>
                  <span className="mx-1 text-slate-500">→</span>
                  <span className="text-slate-400 text-xs">echt:</span>
                  <span>{actualPlayer?.emoji} {actualPlayer?.name}</span>
                  <span className="ml-auto text-lg">{isCorrect ? '✓' : '✕'}</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">…wird aufgedeckt</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
