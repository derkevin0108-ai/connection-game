import type { Category, Depth } from './questions';

export type Player = {
  id: string;
  name: string;
  emoji: string;
  isHost: boolean;
  connected: boolean;
};

export type GamePhase = 'lobby' | 'answering' | 'matching' | 'reveal' | 'discussion' | 'gameEnd';

export type Answer = {
  id: string;
  playerId: string;
  text: string;
};

export type CustomQuestion = {
  id: string;
  text: string;
  authorId: string;
};

export type Round = {
  number: number;
  raterId: string;
  questionText: string;
  questionId: string;
  questionCategory: Category | 'custom';
  questionDepth: Depth | 'custom';
  isCustom: boolean;
  answers: Answer[];
  mappings: Record<string, string>;
  readyForNext: string[]; // playerIds, die "Bereit" geklickt haben (Discussion)
};

export type ConnectionStats = Record<string, Record<string, { correct: number; attempts: number }>>;

export type GameSettings = {
  categories: (Category | 'custom')[]; // <-- Hier ist der Fix! Erlaubt jetzt auch "custom"
  depths: (Depth | 'custom')[];        // <-- Hier zur Sicherheit ebenfalls ergänzt
  totalRounds: number | 'all'; // 'all' = einer pro Spieler
  customQuestions: CustomQuestion[];
};

export type GameState = {
  phase: GamePhase;
  round: Round | null;
  scores: Record<string, number>;
  raterOrder: string[];
  roundIndex: number;
  totalRounds: number;
  settings: GameSettings;
  connections: ConnectionStats;        // persistent über mehrere Spiele im selben Raum
  playedQuestionIds: string[];         // ebenfalls persistent
  gamesPlayed: number;                 // Anzahl Spiele in diesem Raum
};

export type Room = {
  code: string;
  players: Player[];
  hostId: string;
  createdAt: number;
  game: GameState;
};

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
  'lobby:addCustomQuestion': (payload: { code: string; playerId: string; text: string }) => void;
  'lobby:removeCustomQuestion': (payload: { code: string; playerId: string; questionId: string }) => void;
  'game:start': (payload: { code: string; playerId: string }) => void;
  'game:submitAnswer': (payload: { code: string; playerId: string; text: string }) => void;
  'game:submitMappings': (payload: { code: string; playerId: string; mappings: Record<string, string> }) => void;
  'game:revealDone': (payload: { code: string; playerId: string }) => void; // Wechsel reveal -> discussion
  'game:readyForNext': (payload: { code: string; playerId: string }) => void;
  'game:nextRound': (payload: { code: string; playerId: string }) => void; // Host-Override
  'game:skipRater': (payload: { code: string; playerId: string }) => void; // Falls Rater offline
  'game:reset': (payload: { code: string; playerId: string }) => void;
};

export type ServerToClientEvents = {
  'room:update': (room: Room) => void;
  'room:closed': (reason: string) => void;
};