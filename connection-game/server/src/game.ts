import { customAlphabet } from 'nanoid';
import type { GameSettings, GameState, Room } from './types';
import { pickQuestion } from './questions';

const generateAnswerId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

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
    },
    connections: {},
    playedQuestionIds: [],
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
  room.game.settings = settings;
}

export function startGame(room: Room): { ok: boolean; error?: string } {
  const connected = room.players.filter((p) => p.connected);
  if (connected.length < 3) return { ok: false, error: 'Mindestens 3 Spieler nötig.' };
  if (room.game.settings.categories.length === 0)
    return { ok: false, error: 'Mindestens eine Kategorie wählen.' };
  if (room.game.settings.depths.length === 0)
    return { ok: false, error: 'Mindestens eine Tiefe-Stufe wählen.' };

  const order = shuffle(connected.map((p) => p.id));
  const scores: Record<string, number> = {};
  const connections: GameState['connections'] = {};
  for (const p of room.players) {
    scores[p.id] = 0;
    connections[p.id] = {};
  }

  room.game = {
    ...room.game,
    phase: 'answering',
    round: null,
    scores,
    raterOrder: order,
    roundIndex: 0,
    totalRounds: order.length,
    connections,
    playedQuestionIds: [],
  };

  beginRound(room);
  return { ok: true };
}

function beginRound(room: Room) {
  const game = room.game;
  if (game.roundIndex >= game.totalRounds) {
    game.phase = 'gameEnd';
    game.round = null;
    return;
  }
  const raterId = game.raterOrder[game.roundIndex];
  const question = pickQuestion(
    game.settings.categories,
    game.settings.depths,
    game.playedQuestionIds
  );
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
    answers: [],
    mappings: {},
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
    game.round.answers.push({
      id: generateAnswerId(),
      playerId,
      text: cleaned,
    });
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

export function submitMappings(
  room: Room,
  raterId: string,
  mappings: Record<string, string>
) {
  const game = room.game;
  if (!game.round || game.phase !== 'matching') return;
  if (raterId !== game.round.raterId) return;

  game.round.mappings = mappings;

  let correct = 0;
  for (const answer of game.round.answers) {
    const targetId = answer.playerId;
    const guessed = mappings[answer.id];

    // Connection-Stats aktualisieren
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

export function nextRound(room: Room) {
  const game = room.game;
  if (game.phase !== 'reveal') return;
  game.roundIndex++;
  if (game.roundIndex >= game.totalRounds) {
    game.phase = 'gameEnd';
    game.round = null;
  } else {
    beginRound(room);
  }
}

export function resetGame(room: Room) {
  // Settings beibehalten, alles andere resetten
  const previousSettings = room.game.settings;
  room.game = emptyGame();
  room.game.settings = previousSettings;
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
        id: a.id,
        playerId: '',
        text: a.text,
      }));
    } else {
      clone.round.answers = clone.round.answers.map((a) => ({
        id: a.id,
        playerId: '',
        text: '',
      }));
      clone.round.mappings = {};
    }
  }
  return clone;
}
