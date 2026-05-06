import { useMemo } from 'react';
import type { Player, ConnectionStats } from '../lib/types';

type Props = {
  players: Player[];
  connections: ConnectionStats;
};

type Edge = {
  a: Player;
  b: Player;
  strength: number; // 0..1
  attempts: number;
};

// Berechnet gegenseitige Verständnis-Stärke zwischen Spieler-Paaren.
// strength = (A→B Quote + B→A Quote) / 2  (nur wo Versuche existieren)
function computeEdges(players: Player[], conn: ConnectionStats): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i];
      const b = players[j];
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
  return edges;
}

// Knoten gleichmäßig auf einem Kreis verteilen
function layoutCircle(count: number, radius: number, cx: number, cy: number) {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    positions.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return positions;
}

export default function ConnectionNetwork({ players, connections }: Props) {
  const edges = useMemo(() => computeEdges(players, connections), [players, connections]);

  // Top-Edges für die Liste darunter
  const sortedEdges = useMemo(
    () => [...edges].sort((a, b) => b.strength - a.strength),
    [edges]
  );
  const topConnection = sortedEdges[0];

  // SVG-Setup
  const SIZE = 340;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const nodeRadius = 26;
  const ringRadius = SIZE / 2 - nodeRadius - 14;
  const positions = useMemo(
    () => layoutCircle(players.length, ringRadius, cx, cy),
    [players.length, ringRadius]
  );

  function nodePos(playerId: string) {
    const idx = players.findIndex((p) => p.id === playerId);
    return positions[idx];
  }

  if (players.length < 2) {
    return (
      <div className="text-center text-slate-400 py-8">
        Nicht genug Spieler für ein Netzwerk.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="max-w-full"
        >
          {/* Kanten (zuerst, damit sie hinter den Knoten liegen) */}
          {edges.map((edge) => {
            const pa = nodePos(edge.a.id);
            const pb = nodePos(edge.b.id);
            if (!pa || !pb) return null;
            const isTop = topConnection && edge === topConnection && edge.strength > 0;
            // Linienbreite: 1px (schwach) bis 8px (perfekt)
            const width = 1 + edge.strength * 7;
            // Farbe: gold für Top, sonst weiß mit Opacity nach Stärke
            const stroke = isTop ? '#fbbf24' : '#a5b4fc';
            const opacity = isTop ? 1 : 0.15 + edge.strength * 0.7;
            return (
              <line
                key={`${edge.a.id}-${edge.b.id}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={stroke}
                strokeWidth={width}
                strokeOpacity={opacity}
                strokeLinecap="round"
              />
            );
          })}

          {/* Knoten */}
          {players.map((p, idx) => {
            const pos = positions[idx];
            return (
              <g key={p.id} transform={`translate(${pos.x},${pos.y})`}>
                <circle
                  r={nodeRadius}
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                >
                  {p.emoji}
                </text>
                <text
                  y={nodeRadius + 14}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize={12}
                  fontWeight={500}
                >
                  {p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {topConnection && topConnection.strength > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-xl p-4 text-center">
          <div className="text-xs text-amber-200/80 uppercase tracking-wide mb-2">
            Stärkste Connection des Abends 👑
          </div>
          <div className="flex items-center justify-center gap-3 text-lg font-medium">
            <span>
              {topConnection.a.emoji} {topConnection.a.name}
            </span>
            <span className="text-amber-300">↔</span>
            <span>
              {topConnection.b.emoji} {topConnection.b.name}
            </span>
          </div>
          <div className="text-amber-200/80 text-sm mt-2">
            {Math.round(topConnection.strength * 100)}% gegenseitiges Verständnis
          </div>
        </div>
      )}

      {sortedEdges.length > 1 && (
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3 text-center">
            Alle Connections
          </h3>
          <div className="flex flex-col gap-2">
            {sortedEdges.slice(0, 6).map((edge, idx) => (
              <div
                key={`${edge.a.id}-${edge.b.id}`}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-slate-500 w-5 text-right">{idx + 1}.</span>
                <span>
                  {edge.a.emoji} {edge.a.name}
                </span>
                <span className="text-slate-500">↔</span>
                <span>
                  {edge.b.emoji} {edge.b.name}
                </span>
                <span className="ml-auto text-slate-300 tabular-nums">
                  {Math.round(edge.strength * 100)}%
                </span>
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
