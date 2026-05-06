import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom, joinRoom, getRoom, bindSocket, handleDisconnect, leaveRoom,
} from './rooms';
import {
  startGame, submitAnswer, submitMappings, nextRound, resetGame,
  filterGameForViewer, updateSettings, addCustomQuestion, removeCustomQuestion,
  revealDone, readyForNext, skipRater,
} from './game';
import type { ClientToServerEvents, ServerToClientEvents, Room } from './types';

const PORT = Number(process.env.PORT) || 3001;
const ORIGIN = process.env.CLIENT_ORIGIN || '*';

const app = express();
app.use(cors({ origin: ORIGIN }));
app.get('/health', (_, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, { cors: { origin: ORIGIN } });

function broadcastRoom(room: Room) {
  for (const player of room.players) {
    const filteredGame = filterGameForViewer(room.game, player.id);
    const filteredRoom: Room = { ...room, game: filteredGame };
    io.to(`player:${player.id}`).emit('room:update', filteredRoom);
  }
}

io.on('connection', (socket) => {
  console.log(`[socket] connect ${socket.id}`);

  socket.on('room:create', ({ playerId, name, emoji }, cb) => {
    if (!name?.trim()) return cb({ ok: false, error: 'Name fehlt.' });
    const room = createRoom({ id: playerId, name: name.trim().slice(0, 20), emoji });
    socket.join(room.code);
    socket.join(`player:${playerId}`);
    bindSocket(socket.id, playerId, room.code);
    cb({ ok: true, room: { ...room, game: filterGameForViewer(room.game, playerId) } });
    console.log(`[room ${room.code}] erstellt von ${name}`);
  });

  socket.on('room:join', ({ playerId, name, emoji, code }, cb) => {
    if (!name?.trim()) return cb({ ok: false, error: 'Name fehlt.' });
    const result = joinRoom(code.toUpperCase(), { id: playerId, name: name.trim().slice(0, 20), emoji });
    if (!result.ok) return cb(result);
    socket.join(result.room.code);
    socket.join(`player:${playerId}`);
    bindSocket(socket.id, playerId, result.room.code);
    cb({ ok: true, room: { ...result.room, game: filterGameForViewer(result.room.game, playerId) } });
    broadcastRoom(result.room);
    console.log(`[room ${result.room.code}] ${name} beigetreten`);
  });

  socket.on('room:leave', ({ playerId, code }) => {
    const room = leaveRoom(playerId, code);
    socket.leave(code);
    socket.leave(`player:${playerId}`);
    if (room) broadcastRoom(room);
  });

  socket.on('lobby:updateSettings', ({ code, playerId, settings }) => {
    const room = getRoom(code);
    if (!room) return;
    updateSettings(room, playerId, settings);
    broadcastRoom(room);
  });

  socket.on('lobby:addCustomQuestion', ({ code, playerId, text }) => {
    const room = getRoom(code);
    if (!room) return;
    addCustomQuestion(room, playerId, text);
    broadcastRoom(room);
  });

  socket.on('lobby:removeCustomQuestion', ({ code, playerId, questionId }) => {
    const room = getRoom(code);
    if (!room) return;
    removeCustomQuestion(room, playerId, questionId);
    broadcastRoom(room);
  });

  socket.on('game:start', ({ code, playerId }) => {
    const room = getRoom(code);
    if (!room) return;
    if (room.hostId !== playerId) return;
    const result = startGame(room);
    if (!result.ok) { console.log(`[room ${code}] start failed: ${result.error}`); return; }
    broadcastRoom(room);
  });

  socket.on('game:submitAnswer', ({ code, playerId, text }) => {
    const room = getRoom(code);
    if (!room) return;
    submitAnswer(room, playerId, text);
    broadcastRoom(room);
  });

  socket.on('game:submitMappings', ({ code, playerId, mappings }) => {
    const room = getRoom(code);
    if (!room) return;
    submitMappings(room, playerId, mappings);
    broadcastRoom(room);
  });

  socket.on('game:revealDone', ({ code }) => {
    const room = getRoom(code);
    if (!room) return;
    revealDone(room);
    broadcastRoom(room);
  });

  socket.on('game:readyForNext', ({ code, playerId }) => {
    const room = getRoom(code);
    if (!room) return;
    readyForNext(room, playerId);
    broadcastRoom(room);
  });

  socket.on('game:nextRound', ({ code, playerId }) => {
    const room = getRoom(code);
    if (!room) return;
    if (room.hostId !== playerId) return;
    nextRound(room);
    broadcastRoom(room);
  });

  socket.on('game:skipRater', ({ code, playerId }) => {
    const room = getRoom(code);
    if (!room) return;
    if (room.hostId !== playerId) return;
    skipRater(room);
    broadcastRoom(room);
  });

  socket.on('game:reset', ({ code, playerId }) => {
    const room = getRoom(code);
    if (!room) return;
    if (room.hostId !== playerId) return;
    resetGame(room);
    broadcastRoom(room);
  });

  socket.on('disconnect', () => {
    const room = handleDisconnect(socket.id);
    if (room) broadcastRoom(room);
    console.log(`[socket] disconnect ${socket.id}`);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf http://0.0.0.0:${PORT}`);
});
