import { io, Socket } from 'socket.io-client';

// Server-URL: in der Entwicklung lokal, später per .env überschreibbar
const SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
});

// Persistente Spieler-ID im LocalStorage – bleibt über Reloads erhalten
const PLAYER_ID_KEY = 'connection.playerId';

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

// Name + Emoji für Komfort speichern
export function saveProfile(name: string, emoji: string) {
  localStorage.setItem('connection.name', name);
  localStorage.setItem('connection.emoji', emoji);
}

export function loadProfile(): { name: string; emoji: string } {
  return {
    name: localStorage.getItem('connection.name') || '',
    emoji: localStorage.getItem('connection.emoji') || '🦊',
  };
}
