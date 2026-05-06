import { useEffect, useMemo, useState } from 'react';
import type { Player, ConnectionStats } from '../lib/types';

type Props = { players: Player[]; connections: ConnectionStats };

type Edge = {
  a: Player; b: Player; strength: number; attempts: number;
};

function computeEdges(players: Player[], conn: ConnectionStats): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i], b = players[j];
      const aToB = conn[a.id]?.[b.id];
      const bToA = conn[b.id]?.[a.id];
      const rateAB = aToB && aToB.attempts > 0 ? aToB.correct / aToB.attempts : null;
      const rateBA = bToA && bToA.attempts > 0 ? bToA.correct / bToA.attempts : null;
      const rates = [rateAB, rateBA].filter((r): r is number => r !== null);
      if (rates.length === 0) continue;
      const strength = rates.reduce((s, r) => s + r, 0) / rates.length;
      const attempts = (aToB?.attempts || 0) + (bToA?.attempts || 0);
      edges.push({ a, b, strength, attempts });
    }
  }
  return edges.sort((x, y) => y.strength - x.strength);
}

function layoutCircle(count: number, radius: number, cx: number, cy: number) {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    positions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return positions;
}

export default function ConnectionNetwork({ players, connections }: Props) {
  const edges = useMemo(() => computeEdges(players, connections), [players, connections]);
  const topConnection = edges[0];

  const SIZE = 340;
  const cx = SIZE / 2, cy = SIZE / 2, nodeRadius = 26;
  const ringRadius = SIZE / 2 - nodeRadius - 14;
  const positions = useMemo(
    () => layoutCircle(players.length, ringRadius, cx, cy),
    [players.length, ringRadius, cx, cy]
  );

  function nodePos(playerId: string) {
    const idx = players.findIndex((p) => p.id === playerId);
    return positions[idx];
  }

  // Animation: Kanten staffeln einblenden, dann Knoten skalieren
  const [edgesShown, setEdgesShown] = useState(0);
  useEffect(() => {
    setEdgesShown(0);
    if (edges.length === 0) return;
    const interval = setInterval(() => {
      setEdgesShown((n) => {
        if (n >= edges.length) { clearInterval(interval); return n; }
        return n + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [edges.length]);

  if (players.length < 2) {
    return <div className="text-center text-slate-400 py-8">Nicht genug Spieler für ein Netzwerk.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        @keyframes nodePopIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes edgeDraw {
          0% { stroke-dashoffset: 100%; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: var(--target-opacity); }
        }
        @keyframes goldGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5)); }
          50% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.9)); }
        }
      `}</style>

      <div className="flex items-center justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="max-w-full">
          {edges.map((edge, idx) => {
            const pa = nodePos(edge.a.id);
            const pb = nodePos(edge.b.id);
            if (!pa || !pb) return null;
            const visible = idx < edgesShown;
            const isTop = edge === topConnection && edge.strength > 0;
            const width = 1 + edge.strength * 7;
            const stroke = isTop ? '#fbbf24' : '#a5b4fc';
            const targetOpacity = isTop ? 1 : 0.15 + edge.strength * 0.7;
            return (
              <line key={`${edge.a.id}-${edge.b.id}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={stroke} strokeWidth={width}
                strokeLinecap="round"
                style={{
                  opacity: visible ? targetOpacity : 0,
                  transition: 'opacity 600ms ease-out',
                  ...(isTop && visible ? { animation: 'goldGlow 2s ease-in-out infinite' } : {}),
                }}
              />
            );
          })}

          {players.map((p, idx) => {
            const pos = positions[idx];
            return (
              <g key={p.id} transform={`translate(${pos.x},${pos.y})`}
                style={{
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  animation: `nodePopIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 80}ms both`,
                }}>
                <circle r={nodeRadius} fill="#1e293b" stroke="#475569" strokeWidth={2} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={26}>{p.emoji}</text>
                <text y={nodeRadius + 14} textAnchor="middle" fill="#cbd5e1" fontSize={12} fontWeight={500}>
                  {p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {topConnection && topConnection.strength > 0 && edgesShown >= 1 && (
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-xl p-4 text-center"
          style={{ animation: 'nodePopIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
          <div className="text-xs text-amber-200/80 uppercase tracking-wide mb-2">
            Stärkste Connection 👑
          </div>
          <div className="flex items-center justify-center gap-3 text-lg font-medium">
            <span>{topConnection.a.emoji} {topConnection.a.name}</span>
            <span className="text-amber-300">↔</span>
            <span>{topConnection.b.emoji} {topConnection.b.name}</span>
          </div>
          <div className="text-amber-200/80 text-sm mt-2">
            {Math.round(topConnection.strength * 100)}% gegenseitiges Verständnis
          </div>
        </div>
      )}

      {edges.length > 1 && (
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3 text-center">Alle Connections</h3>
          <div className="flex flex-col gap-2">
            {edges.slice(0, 6).map((edge, idx) => (
              <div key={`${edge.a.id}-${edge.b.id}`} className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-5 text-right">{idx + 1}.</span>
                <span>{edge.a.emoji} {edge.a.name}</span>
                <span className="text-slate-500">↔</span>
                <span>{edge.b.emoji} {edge.b.name}</span>
                <span className="ml-auto text-slate-300 tabular-nums">{Math.round(edge.strength * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {edges.length === 0 && (
        <div className="text-center text-slate-400 text-sm py-2">
          Keine Verbindungen entstanden – spielt nochmal eine Runde!
        </div>
      )}
    </div>
  );
}
