// Generiert Sounds programmatisch via Web Audio API.
// Keine externen Dateien, kein Download.

let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  // iOS: Browser pausiert AudioContext, bis User interagiert. resume() ist idempotent.
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export const sounds = {
  // Beim Antwort-Abschicken: kurzer "Ploing"
  submit: () => {
    tone(660, 0.12, 'sine', 0.12);
    setTimeout(() => tone(880, 0.1, 'sine', 0.1), 80);
  },
  // Reveal: Antwort wird aufgedeckt – neutraler Klick
  reveal: () => tone(440, 0.08, 'square', 0.08),
  // Reveal richtig: heller positiver Akkord
  correct: () => {
    tone(523, 0.15, 'sine', 0.15);  // C
    setTimeout(() => tone(659, 0.15, 'sine', 0.15), 60);  // E
    setTimeout(() => tone(784, 0.25, 'sine', 0.18), 120); // G
  },
  // Reveal falsch: kurzer dumpfer Buzz
  wrong: () => tone(165, 0.25, 'sawtooth', 0.1),
  // Spielstart: Aufsteigende Sequenz
  start: () => {
    tone(392, 0.1, 'triangle', 0.13);
    setTimeout(() => tone(523, 0.1, 'triangle', 0.13), 100);
    setTimeout(() => tone(659, 0.18, 'triangle', 0.15), 200);
  },
  // Spielende: kleine Fanfare
  end: () => {
    tone(523, 0.15, 'triangle', 0.15);
    setTimeout(() => tone(659, 0.15, 'triangle', 0.15), 120);
    setTimeout(() => tone(784, 0.15, 'triangle', 0.15), 240);
    setTimeout(() => tone(1047, 0.4, 'triangle', 0.18), 360);
  },
  // Achievement-Reveal: glitzernd
  achievement: () => {
    tone(880, 0.08, 'sine', 0.12);
    setTimeout(() => tone(1175, 0.08, 'sine', 0.12), 60);
    setTimeout(() => tone(1568, 0.2, 'sine', 0.15), 120);
  },
};

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem('connection.muted', value ? '1' : '0');
  } catch { /* */ }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem('connection.muted') === '1';
  } catch {
    return muted;
  }
}

// Init muted-State aus LocalStorage
muted = isMuted();
