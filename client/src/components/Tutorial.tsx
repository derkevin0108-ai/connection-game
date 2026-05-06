import { useState } from 'react';

const SLIDES = [
  {
    emoji: '🎮',
    title: 'So funktioniert Connection',
    text: 'Ein Multiplayer-Spiel, bei dem ihr durch Fragen herausfindet, wer wen am besten kennt – mit viel Diskussion am Ende.',
  },
  {
    emoji: '📝',
    title: 'Jede Runde',
    text: 'Eine Person ist "Rater" und wartet. Alle anderen tippen ihre Antwort auf eine Frage – anonym.',
  },
  {
    emoji: '🎯',
    title: 'Zuordnen',
    text: 'Der Rater sieht die anonymen Antworten und ordnet sie Spielern zu. Pro richtigem Tipp gibt es einen Punkt.',
  },
  {
    emoji: '💬',
    title: 'Diskussion',
    text: "Nach dem Reveal wird's spannend. Sprecht über die Antworten - das ist das eigentliche Herz des Spiels.",
  },
  {
    emoji: '🕸️',
    title: 'Connection-Netzwerk',
    text: 'Am Ende seht ihr, wer wen am besten verstanden hat. Die stärkste Verbindung wird gold gekrönt 👑',
  },
];

type Props = { onClose: () => void };

export default function Tutorial({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function next() {
    if (isLast) {
      try { localStorage.setItem('connection.tutorialSeen', '1'); } catch { /* */ }
      onClose();
    } else {
      setStep(step + 1);
    }
  }

  function skip() {
    try { localStorage.setItem('connection.tutorialSeen', '1'); } catch { /* */ }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex flex-col items-center justify-center px-6 mt-6">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
        <div className="text-7xl">{slide.emoji}</div>
        <h2 className="text-2xl font-bold">{slide.title}</h2>
        <p className="text-slate-300 leading-relaxed">{slide.text}</p>

        <div className="flex gap-1.5 mt-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === step ? 'bg-indigo-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 w-full mt-4">
          <button
            onClick={next}
            className="bg-indigo-500 hover:bg-indigo-400 rounded-lg py-4 font-semibold text-lg"
          >
            {isLast ? 'Loslegen' : 'Weiter'}
          </button>
          {!isLast && (
            <button onClick={skip} className="text-slate-400 text-sm py-2">
              Überspringen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}