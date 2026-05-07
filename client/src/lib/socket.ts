import { io, Socket } from 'socket.io-client';

// Server-URL: in der Entwicklung lokal, später per .env überschreibbar
const SERVER_URL = (import.meta as any).env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  // Hier lassen wir 'transports' absichtlich weg, da es sonst die Verbindung stört!
});

// In-Memory Fallback, falls localStorage blockiert ist (Safari Private Mode etc.)
const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore[key] ?? null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* fall through */
    }
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

const PLAYER_ID_KEY = 'connection.playerId';

export function getPlayerId(): string {
  let id = safeGet(PLAYER_ID_KEY);
  if (!id) {
    id = generateId();
    safeSet(PLAYER_ID_KEY, id);
  }
  return id;
}

// Name + Emoji für Komfort speichern
export function saveProfile(name: string, emoji: string) {
  safeSet('connection.name', name);
  safeSet('connection.emoji', emoji);
}

export function loadProfile(): { name: string; emoji: string } {
  return {
    name: safeGet('connection.name') || '',
    emoji: safeGet('connection.emoji') || '🦊',
  };
}