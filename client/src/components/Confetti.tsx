import { useEffect, useState } from 'react';

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
};

const COLORS = ['#fbbf24', '#f59e0b', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb7185'];

type Props = {
  trigger: number; // ändert sich → neuer Burst
  count?: number;
};

// Erzeugt fallende Konfetti-Partikel.
export default function Confetti({ trigger, count = 24 }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: trigger * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.2 + Math.random() * 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(t);
  }, [trigger, count]);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(280px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: '0',
              width: '8px',
              height: '12px',
              background: p.color,
              transform: `rotate(${p.rotation}deg)`,
              animation: `confettiFall ${p.duration}s cubic-bezier(0.33, 1, 0.68, 1) ${p.delay}s forwards`,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </>
  );
}
