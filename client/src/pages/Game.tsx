import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket, getPlayerId, loadProfile } from '../lib/socket';
import type { Room } from '../lib/types';
import Answering from '../components/Answering';
import Matching from '../components/Matching';
import Reveal from '../components/Reveal';
import Discussion from '../components/Discussion';
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
          if (!res.ok) { alert(res.error); navigate('/'); return; }
          setRoom(res.room);
        }
      );
    }
    if (socket.connected) attemptJoin();
    else socket.once('connect', attemptJoin);
    socket.on('room:update', setRoom);
    return () => { socket.off('room:update', setRoom); };
  }, [code, playerId, navigate]);

  useEffect(() => {
    if (room && room.game.phase === 'lobby') navigate(`/room/${code}`);
  }, [room, code, navigate]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    (async () => {
      try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
      } catch { /* */ }
    })();
    return () => { wakeLock?.release().catch(() => {}); };
  }, []);

  if (!room) return <div className="text-slate-400 mt-20">Lade Spiel…</div>;

  return (
    <>
      {/* Skip-Rater-Hinweis: Host sieht das, wenn Rater offline ist */}
      <RaterDisconnectBanner room={room} playerId={playerId} />

      {(() => {
        switch (room.game.phase) {
          case 'answering': return <Answering room={room} playerId={playerId} />;
          case 'matching':  return <Matching room={room} playerId={playerId} />;
          case 'reveal':    return <Reveal room={room} playerId={playerId} />;
          case 'discussion':return <Discussion room={room} playerId={playerId} />;
          case 'gameEnd':   return <GameEnd room={room} playerId={playerId} />;
          default:          return <div className="text-slate-400 mt-20">…</div>;
        }
      })()}
    </>
  );
}

function RaterDisconnectBanner({ room, playerId }: { room: Room; playerId: string }) {
  const round = room.game.round;
  if (!round) return null;
  if (room.game.phase !== 'answering' && room.game.phase !== 'matching') return null;

  const rater = room.players.find((p) => p.id === round.raterId);
  if (!rater || rater.connected) return null;

  const isHost = room.hostId === playerId;

  function handleSkip() {
    socket.emit('game:skipRater', { code: room.code, playerId });
  }

  return (
    <div className="w-full max-w-md mb-4">
      <div className="bg-amber-500/15 border border-amber-500/40 rounded-lg p-4 text-center">
        <div className="text-2xl mb-1">⚠️</div>
        <div className="text-amber-100 font-medium text-sm mb-1">
          {rater.emoji} {rater.name} ist offline
        </div>
        <div className="text-amber-200/80 text-xs mb-3">
          Spiel hängt – warte kurz oder lass den Host die Runde überspringen.
        </div>
        {isHost && (
          <button
            onClick={handleSkip}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg px-4 py-2 font-medium text-sm"
          >
            Rater überspringen
          </button>
        )}
      </div>
    </div>
  );
}
