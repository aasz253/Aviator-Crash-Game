import { useState, useEffect } from 'react';
import { useGame, useAuth } from '../context/GameContext';

export default function Leaderboard() {
  const { state, currentBets, multiplier } = useGame();
  const { gameMode, user } = useAuth();
  const [allBets, setAllBets] = useState([]);

  useEffect(() => {
    if (state === 'waiting') {
      setAllBets([]);
    }

    if ((state === 'in_progress' || state === 'crashed') && currentBets.length > 0) {
      setAllBets(prev => {
        const existing = [...prev];
        currentBets.forEach(bet => {
          const exists = existing.find(e => e.id === bet.id);
          if (!exists) {
            existing.push({ ...bet });
          } else {
            if (bet.status !== exists.status) {
              exists.status = bet.status;
              exists.multiplier = bet.multiplier;
              exists.winAmount = bet.winAmount;
            }
          }
        });
        return existing;
      });
    }
  }, [state, currentBets]);

  const cashedOut = allBets.filter(b => b.status === 'cashed_out');
  const crashed = allBets.filter(b => b.status === 'crashed');
  const pending = allBets.filter(b => b.status === 'pending');

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-aviator-orange" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Live Bets
      </h3>

      {cashedOut.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium">CASHED OUT</span>
            <span>{cashedOut.length} player{cashedOut.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            {cashedOut.slice().reverse().map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between bg-green-900/20 border border-green-800/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                    {player.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm">{player.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded">
                    {player.multiplier?.toFixed(2)}x
                  </span>
                  <span className="text-green-400 font-bold text-sm">
                    {player.winAmount?.toFixed(2)} KES
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {crashed.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium">CRASHED</span>
            <span>{crashed.length} player{crashed.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            {crashed.slice().reverse().map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                    {player.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm">{player.username}</span>
                </div>
                <span className="text-red-400 font-bold text-sm">
                  -{player.betAmount.toFixed(2)} KES
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && state === 'in_progress' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium">IN GAME</span>
            <span>{pending.length} player{pending.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            {pending.map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between bg-aviator-darker rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-aviator-purple flex items-center justify-center text-xs font-bold">
                    {player.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm">{player.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{player.betAmount.toFixed(2)}</span>
                  <span className="text-aviator-orange font-bold text-sm">
                    {(player.betAmount * multiplier).toFixed(2)} KES
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allBets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {state === 'waiting' ? 'Waiting for bets...' : 'No bets placed'}
        </div>
      )}
    </div>
  );
}
