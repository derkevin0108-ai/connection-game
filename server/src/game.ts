import { customAlphabet } from 'nanoid';
import type { GameSettings, GameState, Room, CustomQuestion } from './types';
import { QUESTIONS, pickQuestion } from './questions';

const generateAnswerId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export function emptyGame(): GameState {
  return {
    phase: 'lobby',
    round: null,
    scores: {},
    raterOrder: [],
    roundIndex: 0,
    totalRounds: 0,
    settings: {
      categories: ['lustig', 'deepTalk', 'hotTakes'],
      depths: ['leicht', 'persoenlich'],
      totalRounds: 'all',
      customQuestions: [],
    },
    connections: {},
    playedQuestionIds: [],
    gamesPlayed: 0,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function updateSettings(room: Room, playerId: string, settings: GameSettings) {
  if (room.hostId !== playerId) return;
  if (room.game.phase !== 'lobby') return;
  if (settings.categories.length === 0 || settings.depths.length === 0) return;
  // Custom questions vor merge bewahren wenn Client die nicht alle mitschickt
  room.game.settings = {
    ...settings,
    customQuestions: settings.customQuestions || room.game.settings.customQuestions,
  };
}

export function addCustomQuestion(room: Room, playerId: string, text: string) {
  if (room.game.phase !== 'lobby') return;
  const cleaned = text.trim().slice(0, 200);
  if (!cleaned) return;
  if (room.game.settings.customQuestions.length >= 50) return;
  room.game.settings.customQuestions.push({
    id: 'cust-' + generateCustomId(),
    text: cleaned,
    authorId: playerId,
  });
}

export function removeCustomQuestion(room: Room, playerId: string, questionId: string) {
  if (room.game.phase !== 'lobby') return;
  // Host darf alle entfernen, andere nur ihre eigenen
  room.game.settings.customQuestions = room.game.settings.customQuestions.filter((q) => {
    if (q.id !== questionId) return true;
    return playerId !== room.hostId && q.authorId !== playerId;
  });
}

export function startGame(room: Room): { ok: boolean; error?: string } {
  const connected = room.players.filter((p) => p.connected);
  if (connected.length < 3) return { ok: false, error: 'Mindestens 3 Spieler nötig.' };
  const s = room.game.settings;
  if (s.categories.length === 0 && s.customQuestions.length === 0)
    return { ok: false, error: 'Mindestens eine Kategorie oder Custom-Fragen wählen.' };
  if (s.depths.length === 0 && s.customQuestions.length === 0)
    return { ok: false, error: 'Mindestens eine Tiefe-Stufe wählen.' };

  const order = shuffle(connected.map((p) => p.id));
  // Anzahl Runden bestimmen
  const total =
    s.totalRounds === 'all'
      ? order.length
      : Math.min(s.totalRounds, order.length);

  // Scores für alle Spieler initialisieren (auch fürs zweite/dritte Spiel im Raum)
  const scores: Record<string, number> = {};
  for (const p of room.players) scores[p.id] = 0;

  // WICHTIG: connections und playedQuestionIds NICHT resetten!
  // -> persistent über mehrere Spiele im selben Raum
  room.game = {
    ...room.game,
    phase: 'answering',
    round: null,
    scores,
    raterOrder: order,
    roundIndex: 0,
    totalRounds: total,
    gamesPlayed: room.game.gamesPlayed + 1,
  };
  // connections-Map sicherstellen, dass alle Spieler einen Eintrag haben
  for (const p of room.players) {
    if (!room.game.connections[p.id]) room.game.connections[p.id] = {};
  }

  beginRound(room);
  return { ok: true };
}

function buildQuestionPool(settings: GameSettings) {
  // Hauptpool: Filter QUESTIONS auf gewählte Kategorien/Tiefen
  const main = QUESTIONS.filter(
    (q) => settings.categories.includes(q.category) && settings.depths.includes(q.depth)
  );
  // Custom-Fragen werden als pseudo-Question-Objekte angefügt
  const custom = settings.customQuestions.map((cq) => ({
    id: cq.id,
    text: cq.text,
    category: 'custom' as const,
    depth: 'custom' as const,
  }));
  return [...main, ...custom];
}

function beginRound(room: Room) {
  const game = room.game;
  if (game.roundIndex >= game.totalRounds) {
    game.phase = 'gameEnd';
    game.round = null;
    return;
  }
  const raterId = game.raterOrder[game.roundIndex];
  const pool = buildQuestionPool(game.settings) as any[];
  const question = pickQuestion(pool, game.playedQuestionIds);
  if (!question) {
    game.phase = 'gameEnd';
    return;
  }
  game.playedQuestionIds.push(question.id);

  game.phase = 'answering';
  game.round = {
    number: game.roundIndex + 1,
    raterId,
    questionId: question.id,
    questionText: question.text,
    questionCategory: question.category,
    questionDepth: question.depth,
    isCustom: (question.category as string) === 'custom', // <-- HIER WURDE DER FIX ANGEWENDET
    answers: [],
    mappings: {},
    readyForNext: [],
  };
}

export function submitAnswer(room: Room, playerId: string, text: string) {
  const game = room.game;
  if (!game.round || game.phase !== 'answering') return;
  if (playerId === game.round.raterId) return;

  const cleaned = text.trim().slice(0, 200);
  if (!cleaned) return;

  const existing = game.round.answers.find((a) => a.playerId === playerId);
  if (existing) {
    existing.text = cleaned;
  } else {
    game.round.answers.push({ id: generateAnswerId(), playerId, text: cleaned });
  }

  const expectedAnswerers = room.players.filter(
    (p) => p.connected && p.id !== game.round!.raterId
  );
  const answered = new Set(game.round.answers.map((a) => a.playerId));
  const allDone = expectedAnswerers.every((p) => answered.has(p.id));
  if (allDone) {
    game.round.answers = shuffle(game.round.answers);
    game.phase = 'matching';
  }
}

export function submitMappings(room: Room, raterId: string, mappings: Record<string, string>) {
  const game = room.game;
  if (!game.round || game.phase !== 'matching') return;
  if (raterId !== game.round.raterId) return;

  game.round.mappings = mappings;

  let correct = 0;
  for (const answer of game.round.answers) {
    const targetId = answer.playerId;
    const guessed = mappings[answer.id];
    if (!game.connections[raterId]) game.connections[raterId] = {};
    if (!game.connections[raterId][targetId]) {
      game.connections[raterId][targetId] = { correct: 0, attempts: 0 };
    }
    game.connections[raterId][targetId].attempts++;
    if (guessed === targetId) {
      game.connections[raterId][targetId].correct++;
      correct++;
    }
  }
  game.scores[raterId] = (game.scores[raterId] || 0) + correct;
  game.phase = 'reveal';
}

// Wechsel reveal -> discussion (vom Client gesendet, nachdem die Reveal-Animation durch ist)
export function revealDone(room: Room) {
  if (room.game.phase !== 'reveal') return;
  if (!room.game.round) return;
  room.game.phase = 'discussion';
}

// Spieler markiert sich als "Bereit für nächste Runde"
export function readyForNext(room: Room, playerId: string) {
  if (room.game.phase !== 'discussion') return;
  if (!room.game.round) return;
  if (!room.game.round.readyForNext.includes(playerId)) {
    room.game.round.readyForNext.push(playerId);
  }
  // Wenn alle anwesenden Spieler bereit sind: weiter
  const connected = room.players.filter((p) => p.connected).map((p) => p.id);
  const allReady = connected.every((id) => room.game.round!.readyForNext.includes(id));
  if (allReady) {
    proceedToNextRound(room);
  }
}

function proceedToNextRound(room: Room) {
  room.game.roundIndex++;
  if (room.game.roundIndex >= room.game.totalRounds) {
    room.game.phase = 'gameEnd';
    room.game.round = null;
  } else {
    beginRound(room);
  }
}

// Host-Override: nächste Runde sofort starten
export function nextRound(room: Room) {
  if (room.game.phase !== 'discussion' && room.game.phase !== 'reveal') return;
  proceedToNextRound(room);
}

// Falls der Rater offline ist und das Spiel hängt: Runde überspringen
export function skipRater(room: Room) {
  if (!room.game.round) return;
  if (room.game.phase !== 'answering' && room.game.phase !== 'matching') return;
  // Diesen Rater ans Ende der Reihenfolge verschieben, damit er später drankommt (falls wieder online)
  const skippedId = room.game.round.raterId;
  room.game.raterOrder = [
    ...room.game.raterOrder.slice(0, room.game.roundIndex),
    ...room.game.raterOrder.slice(room.game.roundIndex + 1),
    skippedId,
  ];
  // Round neu beginnen mit gleichem Index (= jetzt anderer Rater)
  beginRound(room);
}

export function resetGame(room: Room) {
  // Settings + persistente Daten beibehalten, Runden-State resetten
  const previousSettings = room.game.settings;
  const previousConnections = room.game.connections;
  const previousPlayed = room.game.playedQuestionIds;
  const previousGamesPlayed = room.game.gamesPlayed;

  room.game = emptyGame();
  room.game.settings = previousSettings;
  room.game.connections = previousConnections;
  room.game.playedQuestionIds = previousPlayed;
  room.game.gamesPlayed = previousGamesPlayed;
}

export function filterGameForViewer(game: GameState, viewerId: string): GameState {
  const clone: GameState = JSON.parse(JSON.stringify(game));
  if (!clone.round) return clone;

  if (clone.phase === 'answering') {
    clone.round.answers = clone.round.answers.map((a) =>
      a.playerId === viewerId ? a : { id: a.id, playerId: '', text: '' }
    );
    clone.round.mappings = {};
  } else if (clone.phase === 'matching') {
    if (viewerId === clone.round.raterId) {
      clone.round.answers = clone.round.answers.map((a) => ({
        id: a.id, playerId: '', text: a.text,
      }));
    } else {
      clone.round.answers = clone.round.answers.map((a) => ({
        id: a.id, playerId: '', text: '',
      }));
      clone.round.mappings = {};
    }
  }
  return clone;
}