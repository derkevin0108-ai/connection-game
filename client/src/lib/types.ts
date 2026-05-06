export type Category = 'lustig' | 'deepTalk' | 'hotTakes' | 'beziehungen' | 'erinnerungen';
export type Depth = 'leicht' | 'persoenlich' | 'intensiv';

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
  questionId: string;
  questionText: string;
  questionCategory: Category | 'custom';
  questionDepth: Depth | 'custom';
  isCustom: boolean;
  answers: Answer[];
  mappings: Record<string, string>;
  readyForNext: string[];
};

export type ConnectionStats = Record<
  string,
  Record<string, { correct: number; attempts: number }>
>;

export type GameSettings = {
  categories: Category[];
  depths: Depth[];
  totalRounds: number | 'all';
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
  connections: ConnectionStats;
  playedQuestionIds: string[];
  gamesPlayed: number;
};

export type Room = {
  code: string;
  players: Player[];
  hostId: string;
  createdAt: number;
  game: GameState;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  lustig: 'Lustig & Albern',
  deepTalk: 'Deep Talk',
  hotTakes: 'Hot Takes',
  beziehungen: 'Beziehungen',
  erinnerungen: 'Erinnerungen',
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  lustig: 'Eisbrecher, peinliche Geschichten, Macken',
  deepTalk: 'Werte, Träume, Verletzlichkeit',
  hotTakes: 'Meinungen, Tabus, Streit-Themen',
  beziehungen: 'Liebe, Freundschaft, Familie',
  erinnerungen: 'Vergangenheit, Kindheit, prägende Momente',
};

export const DEPTH_LABELS: Record<Depth, { label: string; emoji: string; description: string }> = {
  leicht: { label: 'Leicht', emoji: '🟢', description: 'Smalltalk, witzig, ungefährlich' },
  persoenlich: { label: 'Persönlich', emoji: '🟡', description: 'Ehrlich, etwas verletzlich' },
  intensiv: { label: 'Intensiv', emoji: '🔴', description: 'Tief, unangenehm, kann schmerzen' },
};
