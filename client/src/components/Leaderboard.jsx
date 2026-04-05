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

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-aviator-orange" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Live Bets
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2 px-2 font-medium">PLAYER</th>
              <th className="text-right py-2 px-2 font-medium">BET KES</th>
              <th className="text-right py-2 px-2 font-medium">WIN KES</th>
            </tr>
          </thead>
          <tbody>
            {allBets.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  {state === 'waiting' ? 'Waiting for bets...' : 'No bets placed'}
                </td>
              </tr>
            ) : (
              allBets.map((player, index) => (
                <tr
                  key={player.id || index}
                  className={`border-b border-gray-800 ${
                    player.status === 'cashed_out' ? 'bg-green-900/20' :
                    player.status === 'crashed' ? 'bg-red-900/20' : ''
                  }`}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        player.status === 'cashed_out' ? 'bg-green-600' :
                        player.status === 'crashed' ? 'bg-red-600' :
                        'bg-aviator-purple'
                      }`}>
                        {player.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-300">{player.username}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 text-gray-300">
                    {player.betAmount.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2">
                    {player.status === 'cashed_out' ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-aviator-green font-bold">
                          {player.winAmount.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-500">
                          {player.multiplier?.toFixed(2)}x
                        </span>
                      </div>
                    ) : player.status === 'crashed' ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-aviator-accent font-bold">Lost</span>
                        <span className="text-xs text-aviator-accent">
                          -{player.betAmount.toFixed(2)}
                        </span>
                      </div>
                    ) : state === 'in_progress' ? (
                      <span className="text-aviator-orange font-bold">
                        {(player.betAmount * multiplier).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
