import type { Category, Depth } from './questions';

export type Player = {
  id: string;
  name: string;
  emoji: string;
  isHost: boolean;
  connected: boolean;
};

export type GamePhase = 'lobby' | 'answering' | 'matching' | 'reveal' | 'gameEnd';

export type Answer = {
  id: string;
  playerId: string;
  text: string;
};

export type Round = {
  number: number;
  raterId: string;
  questionText: string;
  questionId: string;
  questionCategory: Category;
  questionDepth: Depth;
  answers: Answer[];
  mappings: Record<string, string>;
};

// Pro Rater A, pro Target B: wie oft hat A versucht B zu erraten,
// und wie oft war's richtig.
export type ConnectionStats = Record<string, Record<string, { correct: number; attempts: number }>>;

export type GameSettings = {
  categories: Category[];
  depths: Depth[];
};

export type GameState = {
  phase: GamePhase;
  round: Round | null;
  scores: Record<string, number>;
  raterOrder: string[];
  roundIndex: number;
  totalRounds: number;
  settings: GameSettings;
  connections: ConnectionStats;
  playedQuestionIds: string[]; // Vermeidung von Wiederholungen innerhalb eines Spiels
};

export type Room = {
  code: string;
  players: Player[];
  hostId: string;
  createdAt: number;
  game: GameState;
};

// Events Client -> Server
export type ClientToServerEvents = {
  'room:create': (
    payload: { playerId: string; name: string; emoji: string },
    callback: (response: { ok: true; room: Room } | { ok: false; error: string }) => void
  ) => void;

  'room:join': (
    payload: { playerId: string; name: string; emoji: string; code: string },
    callback: (response: { ok: true; room: Room } | { ok: false; error: string }) => void
  ) => void;

  'room:leave': (payload: { playerId: string; code: string }) => void;

  'lobby:updateSettings': (payload: { code: string; playerId: string; settings: GameSettings }) => void;
  'game:start': (payload: { code: string; playerId: string }) => void;
  'game:submitAnswer': (payload: { code: string; playerId: string; text: string }) => void;
  'game:submitMappings': (payload: { code: string; playerId: string; mappings: Record<string, string> }) => void;
  'game:nextRound': (payload: { code: string; playerId: string }) => void;
  'game:reset': (payload: { code: string; playerId: string }) => void;
};

// Events Server -> Client
export type ServerToClientEvents = {
  'room:update': (room: Room) => void;
  'room:closed': (reason: string) => void;
};
