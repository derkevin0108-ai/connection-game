import type { Player, ConnectionStats } from './types';

export type Achievement = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  playerIds: string[]; // ein oder zwei Spieler (z.B. Soulmates)
};

function quote(s: { correct: number; attempts: number } | undefined): number | null {
  if (!s || s.attempts === 0) return null;
  return s.correct / s.attempts;
}

export function computeAchievements(
  players: Player[],
  connections: ConnectionStats
): Achievement[] {
  const achievements: Achievement[] = [];
  if (players.length < 2) return achievements;

  // Mind Reader: Höchste Trefferquote als Rater (gesamt über alle Targets)
  let bestRater: { id: string; rate: number } | null = null;
  for (const p of players) {
    let totalCorrect = 0, totalAttempts = 0;
    const stats = connections[p.id];
    if (!stats) continue;
    for (const target of Object.keys(stats)) {
      totalCorrect += stats[target].correct;
      totalAttempts += stats[target].attempts;
    }
    if (totalAttempts === 0) continue;
    const rate = totalCorrect / totalAttempts;
    if (!bestRater || rate > bestRater.rate) bestRater = { id: p.id, rate };
  }
  if (bestRater && bestRater.rate > 0) {
    const player = players.find((p) => p.id === bestRater!.id);
    if (player) {
      achievements.push({
        key: 'mindReader',
        emoji: '🧠',
        title: 'Mind Reader',
        description: `Liest die anderen am besten – ${Math.round(bestRater.rate * 100)}% Trefferquote`,
        playerIds: [player.id],
      });
    }
  }

  // Open Book: am häufigsten richtig erraten worden (höchste rate als Target)
  let bestTarget: { id: string; rate: number } | null = null;
  for (const target of players) {
    let totalCorrect = 0, totalAttempts = 0;
    for (const rater of players) {
      const s = connections[rater.id]?.[target.id];
      if (!s) continue;
      totalCorrect += s.correct;
      totalAttempts += s.attempts;
    }
    if (totalAttempts === 0) continue;
    const rate = totalCorrect / totalAttempts;
    if (!bestTarget || rate > bestTarget.rate) bestTarget = { id: target.id, rate };
  }
  if (bestTarget && bestTarget.rate > 0.5) {
    const player = players.find((p) => p.id === bestTarget!.id);
    if (player) {
      achievements.push({
        key: 'openBook',
        emoji: '📖',
        title: 'Open Book',
        description: `Wird am leichtesten verstanden – ${Math.round(bestTarget.rate * 100)}% richtig erraten`,
        playerIds: [player.id],
      });
    }
  }

  // Mystery Person: am wenigsten richtig erraten worden (mit mind. 2 Versuchen)
  let mystery: { id: string; rate: number } | null = null;
  for (const target of players) {
    let totalCorrect = 0, totalAttempts = 0;
    for (const rater of players) {
      const s = connections[rater.id]?.[target.id];
      if (!s) continue;
      totalCorrect += s.correct;
      totalAttempts += s.attempts;
    }
    if (totalAttempts < 2) continue;
    const rate = totalCorrect / totalAttempts;
    if (!mystery || rate < mystery.rate) mystery = { id: target.id, rate };
  }
  if (mystery && mystery.rate < 0.5) {
    const player = players.find((p) => p.id === mystery!.id);
    if (player) {
      achievements.push({
        key: 'mystery',
        emoji: '🎭',
        title: 'Mystery Person',
        description: `Schwer zu durchschauen – nur ${Math.round(mystery.rate * 100)}% richtig erraten`,
        playerIds: [player.id],
      });
    }
  }

  // Soulmates: Paar mit höchster gegenseitiger Verbindung
  let soulmates: { a: string; b: string; rate: number } | null = null;
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i], b = players[j];
      const aToB = quote(connections[a.id]?.[b.id]);
      const bToA = quote(connections[b.id]?.[a.id]);
      const rates = [aToB, bToA].filter((r): r is number => r !== null);
      if (rates.length < 2) continue; // nur wenn beide Richtungen Daten haben
      const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
      if (!soulmates || avg > soulmates.rate) soulmates = { a: a.id, b: b.id, rate: avg };
    }
  }
  if (soulmates && soulmates.rate > 0.6) {
    const a = players.find((p) => p.id === soulmates!.a);
    const b = players.find((p) => p.id === soulmates!.b);
    if (a && b) {
      achievements.push({
        key: 'soulmates',
        emoji: '💞',
        title: 'Soulmates',
        description: `Verstehen sich gegenseitig zu ${Math.round(soulmates.rate * 100)}%`,
        playerIds: [a.id, b.id],
      });
    }
  }

  return achievements;
}
