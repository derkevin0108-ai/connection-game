import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './lib/socket';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

export default function App() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    function onConnect() {
      setStatus('connected');
      setErrorMsg('');
    }
    function onDisconnect() {
      setStatus('connecting');
    }
    function onError(err: Error) {
      setStatus('error');
      setErrorMsg(err.message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    if (socket.connected) setStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <div
        className={`fixed top-0 left-0 right-0 text-center py-1 text-xs font-mono z-50 ${
          status === 'connected'
            ? 'bg-green-600/80'
            : status === 'error'
            ? 'bg-red-600/80'
            : 'bg-yellow-600/80'
        }`}
      >
        {status === 'connected' && '● verbunden'}
        {status === 'connecting' && '○ verbinde…'}
        {status === 'error' && `✕ Fehler: ${errorMsg}`}
      </div>

      <div className="mt-6 w-full flex flex-col items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join/:code" element={<Home />} />
          <Route path="/room/:code" element={<Lobby />} />
          <Route path="/game/:code" element={<Game />} />
        </Routes>
      </div>
    </div>
  );
}
