import { useState } from 'react';
import { socket } from '../lib/socket';
import type { Room } from '../lib/types';
import { CATEGORY_LABELS, DEPTH_LABELS } from '../lib/types';
import { sounds } from '../lib/sounds';

type Props = { room: Room; playerId: string };

export default function Answering({ room, playerId }: Props) {
  const round = room.game.round;
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!round) return null;
  const isRater = round.raterId === playerId;
  const rater = room.players.find((p) => p.id === round.raterId);
  const ownAnswer = round.answers.find((a) => a.playerId === playerId);
  const alreadySubmitted = !!ownAnswer || submitted;
  const submittedIds = new Set(round.answers.filter((a) => a.playerId).map((a) => a.playerId));

  // Kategorie/Tiefe-Anzeige
  let categoryLabel = '';
  let depthEmoji = '✨';
  let depthLabel = '';
  if (round.isCustom) {
    categoryLabel = 'Eigene Frage';
    depthEmoji = '✨';
    depthLabel = 'Custom';
  } else {
    categoryLabel = CATEGORY_LABELS[round.questionCategory as keyof typeof CATEGORY_LABELS] || '';
    const dm = DEPTH_LABELS[round.questionDepth as keyof typeof DEPTH_LABELS];
    if (dm) { depthEmoji = dm.emoji; depthLabel = dm.label; }
  }

  function handleSubmit() {
    if (!text.trim()) return;
    sounds.submit();
    socket.emit('game:submitAnswer', { code: room.code, playerId, text });
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="text-center text-slate-400 text-sm">
        Runde {round.number} von {room.game.totalRounds}
      </div>

      <div className="bg-slate-800 rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3">
          <span>{depthEmoji}</span>
          <span>{categoryLabel}</span>
          {depthLabel && <><span>·</span><span>{depthLabel}</span></>}
        </div>
        <p className="text-xl font-medium leading-snug">{round.questionText}</p>
      </div>

      <div className="flex items-center gap-2 justify-center text-slate-400 text-sm">
        <span className="text-2xl">{rater?.emoji}</span>
        <span><strong className="text-slate-200">{rater?.name}</strong> rät diese Runde</span>
      </div>

      {isRater ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 text-center">
          <p className="text-slate-300">
            Du bist der Rater. Lehn dich kurz zurück – die anderen tippen ihre Antworten.
          </p>
        </div>
      ) : alreadySubmitted ? (
        <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-lg p-5 text-center">
          <p className="text-emerald-200">✓ Antwort abgeschickt</p>
          <p className="text-slate-400 text-sm mt-2">Warte auf die anderen…</p>
        </div>
      ) : (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Deine Antwort…" maxLength={200} rows={3}
            className="bg-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-indigo-500 resize-none" />
          <button onClick={handleSubmit} disabled={!text.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg py-4 font-semibold text-lg">
            Antwort abschicken
          </button>
        </>
      )}

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-xs text-slate-500 uppercase tracking-wide">Status</h3>
        {room.players.filter((p) => p.id !== round.raterId).map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2">
            <span className="text-xl">{p.emoji}</span>
            <span className="flex-1">{p.name}</span>
            {!p.connected ? (
              <span className="text-slate-500 text-sm">offline</span>
            ) : submittedIds.has(p.id) ? (
              <span className="text-emerald-400 text-sm">✓ fertig</span>
            ) : (
              <span className="text-slate-500 text-sm">tippt…</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
