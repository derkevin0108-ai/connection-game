import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket, getPlayerId, loadProfile } from '../lib/socket';
import type { Room } from '../lib/types';
import Answering from '../components/Answering';
import Matching from '../components/Matching';
import Reveal from '../components/Reveal';
import GameEnd from '../components/GameEnd';

export default function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const playerId = getPlayerId();

  useEffect(() => {
    if (!code) return;
    const profile = loadProfile();

    function attemptJoin() {
      socket.emit(
        'room:join',
        { playerId, name: profile.name || 'Spieler', emoji: profile.emoji, code: code! },
        (res: { ok: true; room: Room } | { ok: false; error: string }) => {
          if (!res.ok) {
            alert(res.error);
            navigate('/');
            return;
          }
          setRoom(res.room);
        }
      );
    }

    if (socket.connected) attemptJoin();
    else socket.once('connect', attemptJoin);

    socket.on('room:update', setRoom);
    return () => {
      socket.off('room:update', setRoom);
    };
  }, [code, playerId, navigate]);

  useEffect(() => {
    if (room && room.game.phase === 'lobby') {
      navigate(`/room/${code}`);
    }
  }, [room, code, navigate]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    (async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      wakeLock?.release().catch(() => {});
    };
  }, []);

  if (!room) return <div className="text-slate-400 mt-20">Lade Spiel…</div>;

  switch (room.game.phase) {
    case 'answering':
      return <Answering room={room} playerId={playerId} />;
    case 'matching':
      return <Matching room={room} playerId={playerId} />;
    case 'reveal':
      return <Reveal room={room} playerId={playerId} />;
    case 'gameEnd':
      return <GameEnd room={room} playerId={playerId} />;
    default:
      return <div className="text-slate-400 mt-20">…</div>;
  }
}
