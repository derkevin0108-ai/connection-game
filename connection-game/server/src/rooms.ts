import { customAlphabet } from 'nanoid';
import type { Player, Room } from './types';
import { emptyGame } from './game';

const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 4);

const rooms = new Map<string, Room>();
const socketToPlayer = new Map<string, { playerId: string; roomCode: string }>();

export function createRoom(hostPlayer: Omit<Player, 'isHost' | 'connected'>): Room {
  let code = generateCode();
  while (rooms.has(code)) code = generateCode();

  const room: Room = {
    code,
    players: [{ ...hostPlayer, isHost: true, connected: true }],
    hostId: hostPlayer.id,
    createdAt: Date.now(),
    game: emptyGame(),
  };

  rooms.set(code, room);
  return room;
}

export function joinRoom(
  code: string,
  player: Omit<Player, 'isHost' | 'connected'>
): { ok: true; room: Room } | { ok: false; error: string } {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: 'Raum nicht gefunden.' };

  const existing = room.players.find((p) => p.id === player.id);
  if (existing) {
    existing.name = player.name;
    existing.emoji = player.emoji;
    existing.connected = true;
    // Score-Eintrag sicherstellen, falls Spiel schon läuft
    if (!(player.id in room.game.scores)) room.game.scores[player.id] = 0;
    return { ok: true, room };
  }

  if (room.players.length >= 8) return { ok: false, error: 'Raum ist voll (max. 8 Spieler).' };
  // Während laufendem Spiel keine neuen Spieler annehmen
  if (room.game.phase !== 'lobby') {
    return { ok: false, error: 'Spiel läuft bereits.' };
  }

  room.players.push({ ...player, isHost: false, connected: true });
  return { ok: true, room };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function bindSocket(socketId: string, playerId: string, roomCode: string) {
  socketToPlayer.set(socketId, { playerId, roomCode });
}

export function handleDisconnect(socketId: string): Room | null {
  const binding = socketToPlayer.get(socketId);
  if (!binding) return null;
  socketToPlayer.delete(socketId);

  const room = rooms.get(binding.roomCode);
  if (!room) return null;

  const player = room.players.find((p) => p.id === binding.playerId);
  if (player) player.connected = false;

  const anyConnected = room.players.some((p) => p.connected);
  if (!anyConnected) {
    setTimeout(() => {
      const r = rooms.get(binding.roomCode);
      if (r && !r.players.some((p) => p.connected)) {
        rooms.delete(binding.roomCode);
        console.log(`[room ${binding.roomCode}] aufgeräumt (alle disconnected)`);
      }
    }, 60_000);
  }
  return room;
}

export function leaveRoom(playerId: string, code: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  if (room.players.length === 0) {
    rooms.delete(code);
    return null;
  }
  return room;
}
